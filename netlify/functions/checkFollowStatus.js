//Serverless Function//
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
            filterByFormula: `SEARCH("${userId}", {${User ID}})`
        }).firstPage();

        const slugs = records.map(record => record.fields.Slug);
        return {
            statusCode: 200,
            body: JSON.stringify(slugs)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.toString() }) };
    }
};
