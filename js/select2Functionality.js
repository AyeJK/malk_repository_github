$('#video-tags').select2({
    placeholder: 'Select tags',
    tags: true,
    maximumSelectionLength: 5,
    tokenSeparators: [','],
    createTag: function(params) {
        var term = $.trim(params.term).toLowerCase(); 

        // If there are no search terms, don't create a tag
        if (term === '') {
            return null;
        }

        // Prepend '#'
        return {
            id: '#' + term, 
            text: '#' + term 
        };
    }
});
$('#category').select2({
    placeholder: 'Select a category',
    minimumResultsForSearch: Infinity,
});
