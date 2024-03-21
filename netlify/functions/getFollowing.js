// Serverless Function
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

        if (records.length === 0) {
            // Handle the case where no records are found
            console.error('No records found for the provided user ID:', userId);
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        const fieldValue = records[0].fields['User is Following Rollup'];
        if (typeof fieldValue !== 'string') {
            // If the field value is not a string, log an error and return an appropriate response
            console.error('User is Following Rollup field is not a string:', fieldValue);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: 'Field value is not a string' })
            };
        }

        // Proceed with splitting the string into an array
        const userIsFollowing = fieldValue.split(',').map(id => id.trim());

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(userIsFollowing)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: error.toString() })
        };
    }
};
