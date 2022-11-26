
const fetch = require('node-fetch');
const tf = require('@tensorflow/tfjs-node');

const fetchSentimentMetadata = async () => {
    try{
      const m = await fetch(`https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json`)
      return m.json()
    } catch(err){
      console.error('--- ERROR: fetchSentimentMetadata() ---')
    }
  }
  
  const fetchSentimentModel = async () => {
    try{
        const model = await tf.loadLayersModel(`https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`);
        return model;
    } catch(err){
        console.error('--- ERROR: fetchSentimentModel() ---')
    }
  };
  
  const padSequences = (sequences, metadata) => {
    return sequences.map(seq => {
      if (seq.length > metadata.max_len) {
        seq.splice(0, seq.length - metadata.max_len);
      }
      if (seq.length < metadata.max_len) {
        const pad = [];
        for (let i = 0; i < metadata.max_len - seq.length; ++i) {
          pad.push(0);
        }
        seq = pad.concat(seq);
      }
      return seq;
    });
  }
  
  const predict = async (text) => {
    const model = await fetchSentimentModel(); 
    const metadata = await fetchSentimentMetadata();
    
    const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    const sequence = trimmed.map(word => {
        const wordIndex = metadata.word_index[word];
        if (typeof wordIndex === 'undefined') {
        return  2; //oov_index
        }
        return wordIndex + metadata.index_from;
    });
    
    const paddedSequence = padSequences([sequence], metadata);
    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);
    const predictOut = model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    return score;
  }

  module.exports = { predict }