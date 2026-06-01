// category.js - Exclusive scripts for Category Page

document.addEventListener('DOMContentLoaded', () => {

  /**
   * Shopify list logic injects product cards dynamically. We need to 
   * wait for the <shopify-list-context> to finish rendering its inner 
   * <article class="product-card"> items before we can manipulate them.
   * We will use a MutationObserver on the grid container to inject badges
   * onto roughly 15-20% of the loaded cards.
   */
  const productGrid = document.getElementById('categoryProductGrid');
  
  if (productGrid) {
    const observer = new MutationObserver((mutations) => {
      let newlyAddedCards = [];
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList.contains('product-card')) {
              newlyAddedCards.push(node);
            }
          });
        }
      });

      if (newlyAddedCards.length > 0) {
        applyRandomBadges(newlyAddedCards);
      }
    });

    observer.observe(productGrid, { childList: true, subtree: true });

    // In case they are already rendered before DOMContentLoaded (rare with web components, but safe)
    const existingCards = productGrid.querySelectorAll('.product-card');
    if (existingCards.length > 0) {
      applyRandomBadges(existingCards);
    }
  }

  function applyRandomBadges(cards) {
    const badgeTypes = [
      { text: 'STAFF PICKS', className: '' },
      { text: 'ONLINE EXCLUSIVE', className: '' },
      { text: 'NEW', className: '' },
      { text: 'SALE', className: 'product-badge--sale' }
    ];

    cards.forEach(card => {
      // Prevent applying multiple badges to the same card
      if (card.querySelector('.product-badge')) return;

      // Roughly 20% chance to get a badge
      if (Math.random() < 0.20) {
        const randomBadge = badgeTypes[Math.floor(Math.random() * badgeTypes.length)];
        const badgeSpan = document.createElement('span');
        badgeSpan.className = `product-badge ${randomBadge.className}`;
        badgeSpan.textContent = randomBadge.text;
        
        // Ensure the card's position is relative or absolute to contain the absolute badge
        card.style.position = 'relative';
        
        // Append badge to the card
        card.appendChild(badgeSpan);
      }
    });
  }

  /**
   * Shopify Web Components Pagination Control
   */
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const listContext = document.getElementById('productGridContext');
  let currentPage = 1;
  const itemsPerPage = 18;

  if (listContext) {
    listContext.addEventListener('shopify-list-context-update', (event) => {
      const { hasNextPage } = event.detail;
      const rangeTextElement = document.querySelector('.pagination-range');
      if (rangeTextElement) {
        // Simple dynamic range calculation
        const start = (currentPage - 1) * itemsPerPage + 1;
        // Since we don't have total count in event.detail directly, we can show a clean range
        rangeTextElement.textContent = `Page ${currentPage}`;
      }
      
      if (!hasNextPage && loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      } else if (loadMoreBtn) {
        loadMoreBtn.style.display = 'block';
      }
    });
  }

  if (loadMoreBtn && listContext) {
    loadMoreBtn.addEventListener('click', () => {
      if (typeof listContext.nextPage === 'function') {
        const originalText = loadMoreBtn.textContent;
        loadMoreBtn.classList.add('is-loading');
        loadMoreBtn.textContent = 'Loading...';
        
        currentPage++;
        try {
          listContext.nextPage();
        } catch (e) {
          console.error(e);
        }
        
        const stopLoading = () => {
          loadMoreBtn.classList.remove('is-loading');
          loadMoreBtn.textContent = originalText;
          listContext.removeEventListener('shopify-list-context-update', stopLoading);
        };
        listContext.addEventListener('shopify-list-context-update', stopLoading);
      }
    });
  }

});
