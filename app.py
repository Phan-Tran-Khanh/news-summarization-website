import torch
import requests
from bs4 import BeautifulSoup
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from flask import Flask, render_template, request, jsonify


app = Flask(__name__)

t5_tokenizer = AutoTokenizer.from_pretrained("t5-small",use_fast=False)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = (AutoModelForSeq2SeqLM
        .from_pretrained("weight")
        .to(device))

def summarizeArticle(inpt_text: str):
  input_feature = t5_tokenizer(inpt_text, truncation=True, max_length=1024, return_tensors="pt")
  # Generate preds id tokens from input ids
  preds = model.generate(
    input_feature["input_ids"].to(device),
    num_beams=15,
    num_return_sequences=1,
    no_repeat_ngram_size=1,
    remove_invalid_values=True,
    max_length=128,
  )
  # Convert id tokens to text
  return t5_tokenizer.batch_decode(preds, skip_special_tokens=True)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/op=text', methods=['POST'])
def summarize_text():
  data = request.get_json()
  summary = summarizeArticle(data['text'])
  return jsonify({'summary': summary})

@app.route('/op=url', methods=['POST'])
def summarize_url():
  data = request.get_json()
  # Send a GET request to the URL
  response = requests.get(data['url'])
  # Create a BeautifulSoup object to parse the HTML content
  soup = BeautifulSoup(response.content, 'html.parser')

  # NOTE: Only apply for VnExpress International sites (e.g. https://e.vnexpress.net)

  # Find the element(s) containing the article content
  article_content = soup.find_all('p', class_='Normal')
  # Extract the text from the article_content element
  article_text = ' '.join([p.get_text() for p in article_content])
  summary = summarizeArticle(article_text)
  return jsonify({'summary': summary})

if __name__ == '__main__':
  app.run(debug=True)