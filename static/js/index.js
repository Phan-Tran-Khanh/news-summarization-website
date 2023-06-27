let timeoutId;

function summarizeTextHandler() {
  clearTimeout(timeoutId);
  if (this.value !== '') {
    timeoutId = setTimeout(summarizeNews('text'), 3000);
  }
}

function keyPressHandler() {
  clearTimeout(timeoutId);
}

function summarizeURLHandler() {
  var input = document.getElementById('url-input');
  var url = input.value;
  var alertMessage = document.getElementById('url-failed-alert');

  if (url.startsWith('https://e.vnexpress.net/news/')) {
    alertMessage.classList.add('d-none');
    summarizeNews('url');
  } else {
    alertMessage.classList.remove('d-none');
  }
};

function summarizeNews(opt) {
  /* BEGIN-Show Loading Progress */
  var outputElement = document.getElementById('text-output');
  var dots = '';
  var interval = setInterval(function () {
    dots += '.';
    outputElement.textContent = 'Summarizing text' + dots;

    if (dots.length === 3) {
      dots = '';
    }
  }, 500);
  /* END-Show Loading Progress */

  var val = document.getElementById(opt + '-input').value;
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      clearInterval(interval);
      var response = JSON.parse(xhr.responseText);
      document.getElementById('text-output').textContent = response.summary;
    } else if (xhr.readyState === 4) {
      console.error(xhr.responseText);
    }
  };

  xhr.open('POST', '/op=' + opt, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ [opt == 'text' ? 'text' : 'url']: val }));
}

function autoExpand(element) {
  element.style.height = 'auto';
  element.style.height = element.scrollHeight + 'px';
}

function countWords(text) {
  var words = 0;

  if ((text.match(/\S+/g)) != null) {
    words = text.match(/\S+/g).length;
  }

  document.getElementById('word-count').textContent = words;
}