// Serverless Function
const Airtable = require('airtable');

exports.handler = async (event) => {
    // Initialize Airtable
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.Airtable_PAT 
    });
    const base = Airtable.base('appaFBiB1nQcgm9Oz');

    const { userId, fieldName } = event.queryStringParameters;

    try {
        const records = await base('Posts').select({
            filterByFormula: `SEARCH("${userId}", {${fieldName}})`
        }).firstPage();

        const slugs = records.map(record => record.fields.Slug);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(slugs)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};
