const emojiCategories = Object.values(emojis);
const SKINS = ['🏻', '🏼', '🏽', '🏾', '🏿'];

function getSurrogate(name) {
  let tone = '';
  if(/_tone[1-5]$/.test(name)) {
    tone = SKINS[name[name.length - 1] - 1];
    name = name.slice(0,-6);
  };

  let emojiCategory = emojiCategories.find(f => f.some(s => s.names.includes(name)));
  if(!emojiCategory) return null;
  let emojiBlock = emojiCategory.find(f => f.names.includes(name));
  return emojiBlock.surrogates + tone;
}

function parseEmojis(content) {
  let probably = content.match(/:([a-z0-9_])+:/gi);
  if(!probably) return content;

  for(let i in probably) {
    let surrogate = getSurrogate(probably[i].slice(1).slice(0,-1));
    if(!surrogate) continue;
    content = content
    .replace(
      probably[i],
      `<img draggable="false" class="emoji" src="${`https://twemoji.maxcdn.com/2/svg/${twemoji.convert.toCodePoint(surrogate)}.svg`}"></img>`
    );
  };

  return content;
}

function parseCodeBlocks(content) {
  let codeBlockMatches = [...content.matchAll(/```(([A-z0-9\-]+?)\n+)?\n*([^]+?)\n*```/g)];

  content = content.split('');

  for(let i = 0; i < codeBlockMatches.length; i++) {
    codeBlockMatches[i] = content.join('').match(/```(([A-z0-9\-]+?)\n+)?\n*([^]+?)\n*```/);
    content = content.join('').split('');
    if(!codeBlockMatches[i]) continue;
    codeBlockMatches[i][3] = codeBlockMatches[i][3].replace(/`/g, '&#96;');
    let block = '<div class="md-code-block-box"><pre class="md-code-block-pre"><code class="md-code-block"><table cellspacing="0">';
    let lines = codeBlockMatches[i][3].split(/\n/g);

    for(let j = lines.length - 1; j > -1; j--) {
      if(!!lines[j])
        break;
      else lines = lines.slice(0, -1);
    };

    for(let j = 0; j < lines.length; j++) {
      if(!!lines[j])
        break;
      else {
        lines = lines.slice(1);
        j--;
      }
    };

    let contentStarted = false;
    let line;
    for(let j = 0; j < lines.length; j++) {
      line = `<tr><td>${j + 1}</td><td>`;
      line += lines[j].replace(/:/g, '&#58;');
      line += '</td></tr>';
      block += line;
    };
    block += '</table></code></pre></div>';
    let next = content.slice(
      codeBlockMatches[i].index + codeBlockMatches[i][0].length,
      codeBlockMatches[i].index + codeBlockMatches[i][0].length + 5
    ).join('');
    if(next === '<br/>')
      content.splice(codeBlockMatches[i].index + codeBlockMatches[i][0].length, 5);
    content.splice(codeBlockMatches[i].index, codeBlockMatches[i][0].length, block);
  };

  content = content.join('');

  return content;
}

function parseLinks(content) {
  let matches = [...content.matchAll(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g)];

  for(let i = 0; i < matches.length; i++) {
    matches[i].index = content.match(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/).index;
    if(content[matches[i].index + matches[i][0].length + 1] !== '>')
      content = content.split('').splice(matches[i].index, matches[i][0].length, `<a class="text-link" target="_blank" href="${matches[i][1]}">${matches[i][1]}</a>`).join('');
  };

  return content;
}

function placeNewLinesHTML(arr) {
  for(let i = 0; i < arr.length; i++) {
    if(!arr[i])
      arr[i] = '<br />';
    else if(!arr[i].endsWith('</div>'))
      arr[i] = `${arr[i]}<br />`
  };
  return arr;
}

function parseAllMD(content) {
  if(!content) return content;

  let newContent = content.replace(/</g, '&#60;')
  .replace(/>/g, '&#62;');

  let quoteMatches = newContent.match(/([\r\n]|^)&#62; [^\n]*(\n *&#62; [^\n]*)*\n?/g);
  if(!!quoteMatches) {
    for(let i = 0; i < quoteMatches.length; i++) {
      newContent = newContent
      .replace(quoteMatches[i], `${quoteMatches[i].startsWith('\n') ? '\n' : ''}<div class='md-quote'><div class='md-quote-border'></div><div class='md-quote-content'>${quoteMatches[i].trim().replace(/&#62;/, '').replace(/(\n)&#62;/g, '$1')}</div></div>${quoteMatches[i].endsWith('\n') ? '\n' : ''}`);
    };
  };

  newContent = newContent
  .replace(/\[([^\[\]]+)\]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\)/g, '<a class="text-link" target="_blank" href="$2">$1</a>');

  newContent = parseLinks(newContent);

  newContent = newContent
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\*([^*]+)\*/g, '<i>$1</i>')
  .replace(/__([^_]+)__/g, '<u>$1</u>')
  .replace(/\|\|([^|]+)\|\|/g, "<span aria-label='clickable-spoiler' onclick='this.classList.remove(\"md-spoiler-covered\")' class='md-spoiler md-spoiler-covered'><span>$1</span></span>")
  .replace(/~~([^~]+)~~/g, '<strike>$1</strike>');

  newContent = parseCodeBlocks(newContent);

  newContent = parseEmojis(newContent);

  newContent = placeNewLinesHTML(newContent.split('\n')).join('');

  newContent = newContent
  .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

  return newContent;
}
