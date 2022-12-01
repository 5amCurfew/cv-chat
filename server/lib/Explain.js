const { Configuration, OpenAIApi } = require("openai");
const dotenv = require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const predict = async () => {
    try{
        const completion = await openai.createCompletion({
            model: "code-davinci-002",
            prompt: `// Code-Block
const evaluateToxicity = async (msg) => {
    try{
        const model = await Toxicity.load(0.8)
        const predictions = await model.classify(msg.text)
        let matches = predictions.filter( (p) => p.results[0].match === true );
        msg.isToxic = matches.length > 0 ? true : false
        msg.textFinal = msg.isToxic ? String.fromCodePoint(0x1F6AB).repeat(3) : msg.text
    }catch(error){
        console.log('--- ERROR evaluateToxicity() (Skipping) ---')
        msg.isToxic = null
        msg.textFinal = msg.text
        console.error(error)
    }
} 
// Here's what the Code-Block is doing:
// 1.`,
            max_tokens: 256,
            top_p: 1,
            temperature: 0.9,
            best_of: 1,
            stop: "\n\n"
        });
            
        console.log(completion.data.choices);
    } catch(error){
        console.log('--- ERROR Explain.predict() (Skipping) ---')
    }
}

predict()