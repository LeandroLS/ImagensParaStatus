module.exports = {
    getNextPagination(currentPage, neighborPage){
        if (currentPage < neighborPage) {
            return parseInt(currentPage) + 1;
        }
    },
    getPrevPagination(currentPage, neighborPage){
        if(currentPage > neighborPage){
            return parseInt(currentPage) - 1;
        }
    },
    getNumbersOfPagination(currentPage,numberOfPages){
        let intervalPages = 3;
        let startPage = currentPage - intervalPages;
        let endPage = currentPage + intervalPages;
        let pages = [];
        var prevPage = '';
        var nextPage = '';
        if(startPage <= 0) {
            endPage = endPage - (startPage - 1);
            startPage = 1;
        }
        if(endPage > numberOfPages){
            endPage = numberOfPages;
        }
        for(var iterator = startPage; iterator <= endPage; iterator++){
            let oneLessOrHigher = iterator - currentPage;
            if(oneLessOrHigher == 1 || oneLessOrHigher == -1){
                var nextPagination = this.getNextPagination(currentPage, iterator);
                var prevPagination = this.getPrevPagination(currentPage, iterator);
            }
            if(nextPagination){
                nextPage = nextPagination;
            }
            if(prevPagination){
                prevPage = prevPagination;
            }
            pages.push(iterator);
        }
        return { pages, prevPage, nextPage };
    }
}