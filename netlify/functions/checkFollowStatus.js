// Serverless Function
const Airtable = require('airtable');

exports.handler = async (event) => {
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.Airtable_PAT
    });
    const base = Airtable.base('appaFBiB1nQcgm9Oz');

    const { userId } = event.queryStringParameters;

    try {
        // Fetch posts where the user ID is present in either 'Followers' or 'User Likes'
        const records = await base('Posts').select({
            filterByFormula: `OR(SEARCH("${userId}", {Followers}), SEARCH("${userId}", {User Likes}))`
        }).firstPage();

        const postsData = records.map(record => {
            return {
                postId: record.id, // Assuming you use the record ID as the post ID
                likes: record.fields['User Likes'] && record.fields['User Likes'].includes(userId),
                follows: record.fields['Followers'] && record.fields['Followers'].includes(userId)
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(postsData)
        };
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.toString() })
        };
    }
};
