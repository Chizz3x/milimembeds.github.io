const preview_embed = document.getElementById('preview-embed'),
      author_text = document.getElementById('author-text'),
      author = document.getElementById('author'),
      author_image = document.getElementById('author-image'),
      title_text = document.getElementById('title-text'),
      title = document.getElementById('title'),
      desc = document.getElementById('desc'),
      image = document.getElementById('image'),
      thumb = document.getElementById('thumb'),
      footer = document.getElementById('footer'),
      footer_content = document.getElementById('footer-content'),
      footer_text = document.getElementById('footer-text'),
      footer_image = document.getElementById('footer-image'),
      timestamp_date = document.getElementById('timestamp-date'),
      timestamp_splitter = document.getElementById('timestamp-splitter'),
      field_items = document.getElementById('fields'),
      template_name = document.getElementById('template-name'),
      editor_UI = document.getElementById('editor-ui');

const author_text_inp = document.getElementById('author-text-input'),
      author_image_inp = document.getElementById('author-image-input'),
      author_link_inp = document.getElementById('author-link-input'),
      title_text_inp = document.getElementById('title-text-input'),
      title_link_inp = document.getElementById('title-link-input'),
      desc_inp = document.getElementById('desc-input'),
      color_inp = document.getElementById('color-input'),
      image_inp = document.getElementById('image-input'),
      thumb_inp = document.getElementById('thumb-input'),
      footer_text_inp = document.getElementById('footer-text-input'),
      footer_image_inp = document.getElementById('footer-image-input'),
      timestamp_inp = document.getElementById('timestamp-input');

let liveTime,
    copiedTimeout;

/*
  embed input properties: {
    author_text,
    author_link,
    author_image,

    title_text,
    title_link,

    desc,

    color,

    fields: [
      {title, value}
    ],

    image,
    thumb,

    footer_text,
    timestamp
    footer_image
  }
*/

function newEmbed() {
  localStorage.milimEmbed = '{}';

  author_text_inp.value = '';
  author_image_inp.value = '';
  author_link_inp.value = '';
  title_text_inp.value = '';
  title_link_inp.value = '';
  desc_inp.value = '';
  color_inp.value = '';
  image_inp.value = '';
  thumb_inp.value = '';
  footer_text_inp.value = '';
  footer_image_inp.value = '';
  if(!!liveTime) clearInterval(liveTime);
  timestamp_inp.value = null;
  let fields = document.getElementsByClassName('embed-build-field-remove');
  let fieldsLength = fields.length;
  for(let i = 0; i < fieldsLength; i++)
    removeInputField({currentTarget: fields[0]});
}

function fillInputs() {
  let embed = JSON.parse(localStorage.milimEmbed);
  let props = Object.keys(embed);

  let el;
  for(let i = 0; i < props.length; i++) {
    if(props[i] == 'fields') {
      for(let j = 0; j < embed.fields.length; j++) {
        createInputField(embed.fields[j].title, embed.fields[j].value, true);
      }
    } else {
      el = document.getElementById(props[i].replace('_', '-') + '-input');
      if(props[i] == 'timestamp') {
        if(embed[props[i]] == '%now%') {
          setCurrentDate();
        } else {
          el.value = getTDate(new Date(embed[props[i]]));
          inputted({target: el}, true);
        }
      } else {
        el.value = embed[props[i]];
        inputted({target: el}, true);
      }
    }
  }
}

if(!localStorage.milimEmbed) {
  localStorage.milimEmbed = JSON.stringify(
    {
      author_text: 'This is an author text',
      author_link: 'https://discord.gg/zG83r6M',
      author_image: 'https://cdn.discordapp.com/embed/avatars/5.png',
      title_text: "This is your title!",
      title_link: "https://discord.gg/zG83r6M",
      desc: "OH and this is description! For now it doesnt support any markdown :,(",
      color: '#8334eb',
      image: 'https://cdn.discordapp.com/embed/avatars/5.png',
      thumb: 'https://cdn.discordapp.com/embed/avatars/5.png',
      footer_text: 'This is your footer text.',
      footer_image: 'https://cdn.discordapp.com/embed/avatars/5.png',
      timestamp: '%now%',
      fields: [
        {title: "1st field", value: "And here is the title"},
        {title: '2nd field', value: "And that's another title"}
      ]
    }
  )
};

fillInputs();

if(!localStorage.milimEmbedTemplates)
  localStorage.milimEmbedTemplates = "[]";

if(!localStorage.milimEmbedTemplateName) {
  localStorage.milimEmbedTemplateName = 'Template 1';
  document.getElementById('template-name').innerHTML = 'Template 1';
};

if(!localStorage.milimPrefix)
  localStorage.milimPrefix = '==';
document.getElementById('prefix-input').value = localStorage.milimPrefix;

// create preview field
function createPreviewField(index, title, value) {
  let el = document.createElement('div');
  el.id = `field-${index}`;
  el.classList.add('embed-field');
  if(!title || !value) el.classList.add('hidden');

  let cont = document.createElement('div');
  cont.classList.add('embed-field-content');
  cont.classList.add('embed-text');

  let field_title = document.createElement('div');
  field_title.classList.add('embed-field-title');
  if(!!title) field_title.innerHTML = title;

  let field_value = document.createElement('div');
  field_value.classList.add('embed-field-value');
  if(!!value) field_value.innerHTML = value;

  cont.appendChild(field_title);
  cont.appendChild(field_value);

  el.appendChild(cont);

  fields.appendChild(el);
}

// create input field
function createInputField(field_title, field_value, load) {
  let i = document.getElementsByClassName('embed-build-field-item').length + 1;

  createPreviewField(i, field_title, field_value);

  if(!load) {
    let embed = JSON.parse(localStorage.milimEmbed);
    if(!embed.fields) embed.fields = [{}]
      else embed.fields.push({});
    localStorage.milimEmbed = JSON.stringify(embed);
  };

  let item = document.createElement('div');
  item.classList.add('embed-build-field-item');
  item.setAttribute('data-index', i);

  let name = document.createElement('span');
  name.classList.add('embed-build-field-title');

  let name_text = document.createElement('span');
  name_text.classList.add('embed-build-field-title-text');
  name_text.innerHTML = `Field #${i}`

  let remove_icon = document.createElement('span');
  remove_icon.classList.add('icon-remove');

  let remove_btn = document.createElement('span');
  remove_btn.classList.add('embed-build-field-remove');
  remove_btn.title = 'remove';
  remove_btn.addEventListener('click', removeInputField);

  let title = document.createElement('div');
  title.classList.add('custom-input');

  let title_span = document.createElement('span');
  title_span.classList.add('embed-build-span');
  title_span.innerHTML = 'Title:';

  let title_textarea = document.createElement('textarea');
  title_textarea.id = `field-${i}-title-input`;
  title_textarea.setAttribute('data-index', i);
  title_textarea.setAttribute('data-name', 'title');
  title_textarea.classList.add('embed-input-small');
  title_textarea.addEventListener('input', inputted);
  if(!!field_title) title_textarea.value = field_title;

  let value = document.createElement('div');
  value.classList.add('custom-input');

  let value_span = document.createElement('span');
  value_span.classList.add('embed-build-span');
  value_span.innerHTML = 'Value:';

  let value_textarea = document.createElement('textarea');
  value_textarea.id = `field-${i}-value-input`;
  value_textarea.setAttribute('data-index', i);
  value_textarea.setAttribute('data-name', 'value');
  value_textarea.classList.add('embed-input-big');
  value_textarea.addEventListener('input', inputted);
  if(!!field_value) value_textarea.value = field_value;

  remove_btn.appendChild(remove_icon);

  name.appendChild(remove_btn);
  name.appendChild(name_text);

  title.appendChild(title_span);
  title.appendChild(title_textarea);

  value.appendChild(value_span);
  value.appendChild(value_textarea);

  item.appendChild(name);
  item.appendChild(title);
  item.appendChild(value);

  let box = document.getElementsByClassName('embed-build-field-box')[0];
  box.insertBefore(item, document.getElementById('add-field-btn-box'));
}

function rebuildFields(embed) {
  let field_items_length = field_items.children.length;
  for(let i = 0; i < field_items_length; i++)
    field_items.removeChild(field_items.children[0]);

  if(!embed.fields) return;

  for(let i = 0; i < embed.fields.length; i++) {
    createPreviewField(i + 1, embed.fields[i].title, embed.fields[i].value);
  }
}

function getImageDims(url) {
  return new Promise(p => {
    const img = new Image();
    img.onload = function() {
      p(this);
    };
    img.src = url;
  });
}

// remove input field
function removeInputField(e) {
  let field_item = e.currentTarget.closest('.embed-build-field-item');

  let index = field_item.getAttribute('data-index');

  field_item.remove();

  let fields = document.getElementsByClassName('embed-build-field-item');

  for(let i = 0; i < fields.length; i++) {
    fields[i].setAttribute('data-index', i + 1);
    fields[i].getElementsByClassName('embed-build-field-title-text')[0].innerHTML = `Field #${i + 1}`;
    fields[i].getElementsByClassName('embed-input-small')[0].id = `field-${i + 1}-title-input`;
    fields[i].getElementsByClassName('embed-input-small')[0].setAttribute('data-index', i + 1);
    fields[i].getElementsByClassName('embed-input-big')[0].id = `field-${i + 1}-value-input`;
    fields[i].getElementsByClassName('embed-input-big')[0].setAttribute('data-index', i + 1);
  };

  let embed = JSON.parse(localStorage.milimEmbed);

  if(!!embed.fields) {
    embed.fields.splice(index - 1, 1);
    if(!embed.fields.length) delete embed.fields;
    localStorage.milimEmbed = JSON.stringify(embed);
  };

  rebuildFields(embed);
}

function removeColor() {
  let embed = JSON.parse(localStorage.milimEmbed);

  color_inp.value = '';
  delete embed.color;
  preview_embed.removeAttribute('style');

  localStorage.milimEmbed = JSON.stringify(embed);
}

function getTDate(date) {
  let year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate(),
      hr = date.getHours(),
      min = date.getMinutes();

  hr = hr < 10 ? '0'+hr : hr;
  min = min < 10 ? '0'+min : min;
  month = month < 10 ? '0'+month : month;
  day = day < 10 ? '0'+day : day;

  return `${year}-${month}-${day}T${hr}:${min}`
}

function embedDate(val, embed) {
  if(!!embed && !!liveTime)
    clearInterval(liveTime);

  if(!!val) {
    let date = new Date(val);
    let now = new Date();
    if(!!embed) embed.timestamp = date.getTime();
    let year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hr = date.getHours(),
        min = date.getMinutes();

    min = min < 10 ? '0'+min : min;
    month = month < 10 ? '0'+month : month;
    day = day < 10 ? '0'+day : day;

    timestamp_date.innerHTML = now.getFullYear() - year == 0 && (now.getMonth() + 1) - month == 0 && now.getDate() - day == 0 ?
      `Today at ${hr}:${min}`
    : now.getFullYear() - year == 0 && (now.getMonth() + 1) - month == 0 && now.getDate() - day == 1 ?
      `Yesterday at ${hr}:${min}`
    : now.getFullYear() - year == 0 && (now.getMonth() + 1) - month == 0 && now.getDate() - day == -1 ?
      `Tomorrow at ${hr}:${min}`
    : `${month}/${day}/${year}`;
  } else {
    timestamp_date.innerHTML = '';
    if(!!embed) delete embed.timestamp;
  }
}

function setCurrentDate() {
  let embed = JSON.parse(localStorage.milimEmbed);

  let now = new Date();
  document.getElementById('timestamp-input').value = getTDate(now);
  embedDate(getTDate(now));
  embed.timestamp = '%now%';

  if(!!liveTime)
    clearInterval(liveTime);
  liveTime = setInterval(() => {
    let _now = new Date();
    document.getElementById('timestamp-input').value = getTDate(_now);
    embedDate(getTDate(_now));
  }, 1000);

  localStorage.milimEmbed = JSON.stringify(embed);

  inputted({target: {value: '%now%', id: 'timestamp-input'}})
}

function editTemplateName() {
  let template_box = document.getElementById('template-name-box');
  let template_input = document.getElementById('template-name-input');
  template_box.classList.add('hidden');
  template_input.classList.remove('hidden');
  template_input.focus();
  template_input.value = template_name.innerHTML;
}

function saveTemplate() {
  let templates = JSON.parse(localStorage.milimEmbedTemplates);
  templates.push({
    name: localStorage.milimEmbedTemplateName,
    embed: JSON.parse(localStorage.milimEmbed)
  });
  localStorage.milimEmbedTemplates = JSON.stringify(templates);
}

function editTemplateClose(e) {
  if(!!e.key && e.key !== 'Enter') return;
  if(!e.target.classList.contains('hidden')) {
    let template_box = document.getElementById('template-name-box');
    e.target.classList.add('hidden');
    template_box.classList.remove('hidden');
  }
}

function resetButtonInner(btn) {
  btn.innerHTML = btn.getAttribute('data-innerHTML');
}

function copyCommand(e) {
  let command = `${localStorage.milimPrefix}say `;
  let embed = JSON.parse(localStorage.milimEmbed);
  if(!!embed.fields) {
    embed.fields = embed.fields.filter(f => !!f.title && !!f.value);
    if(embed.fields.length < 1)
      delete embed.fields;
  };
  if(!embed.author_text) {
    delete embed.author_link;
    delete embed.author_image;
  };
  if(!embed.title_text) {
    delete embed.author_link;
  };
  if(!embed.footer_text) {
    delete embed.footer_image;
  };
  command += JSON.stringify(embed);
  navigator.clipboard.writeText(command);

  if(!!copiedTimeout) {
    clearTimeout(copiedTimeout);
    resetButtonInner(e.currentTarget);
  };
  e.currentTarget.setAttribute('data-innerHTML', e.currentTarget.innerHTML);
  e.currentTarget.innerHTML = 'Copied!';
  copiedTimeout = setTimeout(() => {
    resetButtonInner(document.getElementById('copy-command-btn'))
  }, 1000)
}

function changePrefix(e) {
  localStorage.milimPrefix = e.target.value;
}

async function inputted(e, load) {
  let embed = JSON.parse(localStorage.milimEmbed);

  let val = e.target.value.trim();

  switch(e.target.id) {
    case 'template-name-input':
      localStorage.milimEmbedTemplateName = val;
      template_name.innerHTML = val;
      break;
    case 'author-text-input':
      if(!!val) {
        embed.author_text = val;
        author.classList.remove('hidden');
      } else {
        delete embed.author_text;
        author.classList.add('hidden');
      };

      author_text.innerHTML = !!embed.author_link ?
        `<a href="${embed.author_link}">${val}</a>`
      : val;

      break;
    case 'author-link-input':
      if(!!val)
        embed.author_link = val
      else delete embed.author_link;

      author_text.innerHTML = !!val ?
        `<a href="${val}">${embed.author_text}</a>`
      : embed.author_text;

      break;
    case 'author-image-input':
      if(!!val) {
        embed.author_image = val;
        author_image.classList.remove('hidden');
      } else {
        delete embed.author_image;
        author_image.classList.add('hidden');
      };

      author_image.src = val;

      break;
    case 'title-text-input':
      if(!!val) {
        embed.title_text = val;
        title.classList.remove('hidden');
      } else {
        delete embed.title_text;
        title.classList.add('hidden');
      };

      title_text.innerHTML = !!embed.title_link ?
        `<a href="${embed.title_link}">${val}</a>`
      : val;

      break;
    case 'title-link-input':
      if(!!val)
        embed.title_link = val
      else delete embed.title_link;

      title_text.innerHTML = !!val ?
        `<a href="${val}">${embed.title_text}</a>`
      : embed.title_text;

      break;
    case 'desc-input':
      if(!!val) {
        embed.desc = val;
        desc.classList.remove('hidden');
      } else {
        delete embed.desc;
        desc.classList.add('hidden');
      };

      desc.innerHTML = val;

      break;
    case 'color-input':
      if(!!val) {
        embed.color = val;
        preview_embed.style.borderColor = val;
      } else {
        removeColor();
      };

      break;
    case 'image-input':
      if(!!val) {
        embed.image = val;
        let img_dims = await getImageDims(val);
        if(img_dims.width > 400) {
          image.style.width = image.children[0].style.width = '400px';
          image.style.height = image.children[0].style.height = `${(1 / img_dims.width * 400) * img_dims.height}px`;
        } else if(img_dims.height > 300) {
          image.style.height = image.children[0].style.height = '300px';
          image.style.width = image.children[0].style.width = `${(1 / img_dims.height * 300) * img_dims.width}px`;
        } else {
          image.style.height = image.children[0].style.height = `${img_dims.height}px`;
          image.style.width = image.children[0].style.width = `${img_dims.width}px`;
        };
        image.classList.remove('hidden');
      } else {
        delete embed.image;
        image.classList.add('hidden');
      };

      image.children[0].src = val;

      break;
    case 'thumb-input':
      if(!!val) {
        embed.thumb = val;
        let img_dims = await getImageDims(val);
        if(img_dims.width > 80) {
          thumb.style.width = thumb.children[0].style.width = '80px';
          thumb.style.height = thumb.children[0].style.height = `${(1 / img_dims.width * 80) * img_dims.height}px`;
        } else if(img_dims.height > 80) {
          thumb.style.height = thumb.children[0].style.height = '80px';
          thumb.style.width = thumb.children[0].style.width = `${(1 / img_dims.height * 80) * img_dims.width}px`;
        } else {
          thumb.style.height = thumb.children[0].style.height = `${img_dims.height}px`;
          thumb.style.width = thumb.children[0].style.width = `${img_dims.width}px`;
        };
        thumb.classList.remove('hidden');
      } else {
        delete embed.thumb;
        thumb.classList.add('hidden');
      };

      thumb.children[0].src = val;

      break;
    case 'footer-text-input':
      if(!!val) {
        embed.footer_text = val;
        footer.classList.remove('hidden');
        footer_content.classList.remove('hidden');
        if(!!embed.timestamp)
          timestamp_splitter.classList.remove('hidden')
        else timestamp_splitter.classList.add('hidden');
      } else {
        if(!embed.timestamp)
          footer.classList.add('hidden');
        delete embed.footer_text;
        footer_content.classList.add('hidden');
        timestamp_splitter.classList.add('hidden');
      };

      footer_text.innerHTML = val;

      break;
    case 'timestamp-input':
      if(val !== '%now%')
        embedDate(val, embed);

      if(!!embed.footer_text && !!val)
        timestamp_splitter.classList.remove('hidden');
      else timestamp_splitter.classList.add('hidden');

      if(!!embed.footer_text || !!val)
        footer.classList.remove('hidden')
      else footer.classList.add('hidden');

      break;
    case 'footer-image-input':
      if(!!val) {
        embed.footer_image = val;
        footer_image.classList.remove('hidden');
      } else {
        delete embed.footer_image;
        footer_image.classList.add('hidden');
      };

      footer_image.src = val;

      break;
    default:
      if(e.target.id.startsWith('field-')) {
        let index = e.target.getAttribute('data-index');
        let name = e.target.getAttribute('data-name');
        let f = document.getElementById(`field-${index}`);

        let other_name = name == 'title' ? 'value' : 'title';
        let other_val = (document.getElementById(`field-${index}-${other_name}-input`) || {value: ''}).value.trim();

        embed.fields[index - 1][name] = val;
        embed.fields[index - 1][other_name] = other_val;

        if(!!embed.fields[index - 1][name] && !!embed.fields[index - 1][other_name]) {
          f.getElementsByClassName(`embed-field-${name}`)[0].innerHTML = embed.fields[index - 1][name];
          f.getElementsByClassName(`embed-field-${other_name}`)[0].innerHTML = embed.fields[index - 1][other_name];
          f.classList.remove('hidden');
        } else f.classList.add('hidden');
      }
  }

  if(!load) localStorage.milimEmbed = JSON.stringify(embed);
}

function arrayify(els) {
  let arr = [];

  for(let i = 0; i < els.length; i++)
    arr.push(els[i]);

  return arr;
}

(() => {
  let builder = document.getElementById('build-embed');

  let inputs = builder.getElementsByTagName('input');
  let textareas = builder.getElementsByTagName('textarea');

  let els = arrayify(inputs);
  els = els.concat(arrayify(textareas));

  for(let i = 0; i < els.length; i++) {
    els[i].addEventListener('input', inputted);
  };
})()
