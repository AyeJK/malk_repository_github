// Get Likes
const Airtable = require('airtable');

exports.handler = async (event) => {
    // Initialize Airtable
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.Airtable_PAT
    });
    const base = Airtable.base('appaFBiB1nQcgm9Oz'); 
    const { userId } = event.queryStringParameters;

    try {
        const records = await base('Users').select({
            filterByFormula: `{MS User ID} = '${userId}'`
        }).firstPage();
        const likedPosts = records.length > 0 ? records[0].fields['Liked Posts'] : [];

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(likedPosts)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};
