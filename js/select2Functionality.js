$('#video-tags').select2({
    placeholder: 'Select tags',
    tags: true,
    maximumSelectionLength: 5,
    tokenSeparators: [','],
    createTag: function(params) {
        // Debugging: Log the original term
        console.log("Original term:", params.term);

        // Trim the input term and convert it to lowercase
        var term = $.trim(params.term).toLowerCase();

        // Debugging: Log the processed term
        console.log("Processed term:", term);

        // If there are no search terms (after trimming and converting to lowercase), don't create a tag
        if (term === '') {
            return null;
        }

        // Prepend '#' to the lowercase tag
        var tag = {
            id: '#' + term, // The ID is now based on the lowercase term
            text: '#' + term // The displayed text is also based on the lowercase term
        };

        // Debugging: Log the created tag
        console.log("Created tag:", tag);

        return tag;
    }
});
$('#category').select2({
    placeholder: 'Select a category',
    minimumResultsForSearch: Infinity,
});
