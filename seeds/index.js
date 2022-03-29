const cities = require('./cities');
const { places, descriptors } = require('./seedhelper');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {createApi} = require('unsplash-js');
const nodeFetch = require('node-fetch');
const { json } = require('express/lib/response');
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
});
const sample = array=>array[Math.floor(Math.random()*array.length)];

const unsplash = createApi({
    accessKey:'njMqZLxno8ptTiQzkpPqtwcg5Nsd7tHOxnTTpICXlBw',
    fetch:nodeFetch
});
const randomPhoto = async()=>{
    const data = await  unsplash.photos.getRandom({
        topicIds:['camping']
    });    
    return data.response.urls.regular;
 }
const seedDB = async () => {
    await Campground.deleteMany({});    
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);        
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:await randomPhoto(),
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem doloribus repellendus quasi hic, deserunt impedit consequuntur non dicta obcaecati, optio dolores itaque quia minima in quam natus sunt! Magni, accusamus.',
            price:Math.floor(Math.random()*20)+10
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    console.log('Seeding complete!');
    mongoose.connection.close();
})
