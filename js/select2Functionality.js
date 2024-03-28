$('#video-tags').select2({
    placeholder: 'Select tags',
    tags: true,
    maximumSelectionLength: 5,
    tokenSeparators: [','],
    createTag: function(params) {
        var term = $.trim(params.term).toLowerCase(); // Ensure the tag is in lowercase

        // If there are no search terms, don't create a tag
        if (term === '') {
            return null;
        }

        // Prepend '#' to the lowercase tag and ensure it's unique in case-insensitive manner
        var isDuplicate = $(this.$element[0]).find("option").filter(function() {
            return this.text.toUpperCase() === ('#' + term).toUpperCase();
        }).length;

        if (isDuplicate) {
            return null;
        }

        return {
            id: '#' + term, // The ID is now based on the lowercase term
            text: '#' + term // The displayed text is also based on the lowercase term
        };
    }
});
$('#category').select2({
    placeholder: 'Select a category',
    minimumResultsForSearch: Infinity,
});