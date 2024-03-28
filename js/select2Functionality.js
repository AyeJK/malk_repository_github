$('#video-tags').select2({
    placeholder: 'Select tags',
    tags: true,
    maximumSelectionLength: 5,
    tokenSeparators: [','],
    createTag: function(params) {
        // If there are no search terms, don't create a tag
        if ($.trim(params.term) === '') {
            return null;
        }
        // Prepend '#' to the tag
        return {
            id: '#!' + $.trim(params.term),
            text: '#!' + $.trim(params.term)
        };
    }
});
$('#category').select2({
    placeholder: 'Select a category',
    minimumResultsForSearch: Infinity,
});