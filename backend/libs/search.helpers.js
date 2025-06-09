export default {
    // Validate search query parameters
    validateSearchQuery: (query) => {
        if (!query || typeof query !== 'string') {
            return { valid: false, error: 'Query must be a non-empty string' };
        }
        
        if (query.trim().length < 2) {
            return { valid: false, error: 'Query must be at least 2 characters long' };
        }
        
        if (query.length > 500) {
            return { valid: false, error: 'Query must be less than 500 characters' };
        }
        
        return { valid: true };
    },

    // Sanitize search query to prevent injection
    sanitizeQuery: (query) => {
        return query.trim().replace(/[<>]/g, '');
    },

    // Parse date filters
    parseDateFilter: (dateString) => {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        
        return date;
    },

    // Build search filters object
    buildSearchFilters: (queryParams) => {
        const filters = {};
        
        if (queryParams.authorId) {
            filters.authorId = queryParams.authorId;
        }
        
        if (queryParams.channelId) {
            filters.channelId = queryParams.channelId;
        }
        
        if (queryParams.serverId) {
            filters.serverId = queryParams.serverId;
        }
        
        if (queryParams.hasAttachments) {
            filters.hasAttachments = queryParams.hasAttachments === 'true';
        }
        
        if (queryParams.dateFrom) {
            filters.dateFrom = this.parseDateFilter(queryParams.dateFrom);
        }
        
        if (queryParams.dateTo) {
            filters.dateTo = this.parseDateFilter(queryParams.dateTo);
        }
        
        return filters;
    },

    // Extract keywords from search query
    extractKeywords: (query) => {
        return query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));
    },

    // Calculate search relevance score
    calculateRelevanceScore: (message, searchTerms) => {
        let score = 0;
        const content = message.content.toLowerCase();
        
        searchTerms.forEach(term => {
            const termCount = (content.match(new RegExp(term, 'g')) || []).length;
            score += termCount;
            
            // Boost score if term appears in the beginning
            if (content.startsWith(term)) {
                score += 2;
            }
        });
        
        return score;
    },

    // Format search results for response
    formatSearchResults: (messages, searchQuery) => {
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            edited: message.edited,
            attachments: message.attachments,
            author: message.author,
            channel: message.channel,
            relevanceScore: message.relevanceScore || 0
        }));
    },

    // Generate search summary
    generateSearchSummary: (results, query, filters) => {
        const summary = {
            totalResults: results.length,
            searchQuery: query,
            appliedFilters: Object.keys(filters).length,
            hasAttachments: results.filter(r => r.attachments && r.attachments.length > 0).length,
            uniqueAuthors: [...new Set(results.map(r => r.author.id))].length,
            uniqueChannels: [...new Set(results.map(r => r.channel?.id).filter(Boolean))].length,
            dateRange: {
                earliest: results.length > 0 ? Math.min(...results.map(r => new Date(r.createdAt).getTime())) : null,
                latest: results.length > 0 ? Math.max(...results.map(r => new Date(r.createdAt).getTime())) : null
            }
        };
        
        return summary;
    }
};