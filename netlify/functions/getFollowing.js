// Serverless Function
const Airtable = require('airtable');

exports.handler = async (event) => {
    // Initialize Airtable
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.Airtable_PAT
    });
    const base = Airtable.base('appaFBiB1nQcgm9Oz'); // Your Airtable base ID

    // Extract the 'userId' from the event's query string parameters
    // This 'userId' is the 'MS User ID' of the logged-in user
    const { userId } = event.queryStringParameters;

    try {
        // Query the 'Users' table to find the record for the logged-in user
        // based on their 'MS User ID'
        const records = await base('Users').select({
            // Use a formula to find the exact record matching the logged-in user's 'MS User ID'
            filterByFormula: `{MS User ID} = '${userId}'`
        }).firstPage();

        // Assuming there is only one record per user, extract the 'User Is Following' field
        // This field should contain a list (array) of User IDs that the logged-in user is following
        const userIsFollowing = records.length > 0 ? records[0].fields['User Is Following'] : [];

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(userIsFollowing) // Return the list of following User IDs
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};
