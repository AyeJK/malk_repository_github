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
        // Fetch the user record
        const userRecords = await base('Users').select({
            filterByFormula: `{MS User ID} = '${userId}'`
        }).firstPage();

        if (userRecords.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
        }

        const user = userRecords[0];
        const likedPostIds = user.fields['Liked Posts Rollup']; // Assuming this field holds an array of liked post IDs

        if (!likedPostIds || likedPostIds.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }

        // Fetch the liked posts
        const likedPosts = await base('Posts').select({
            filterByFormula: `OR(${likedPostIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`
        }).all();

        const likedPostsData = likedPosts.map(post => ({
            id: post.id,
            title: post.fields['Title'], // Adjust field names as per your table structure
            content: post.fields['Content'],
            // Add other fields as needed
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(likedPostsData)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};
