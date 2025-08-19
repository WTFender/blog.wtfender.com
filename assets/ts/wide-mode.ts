// Wide mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wide mode script loaded');
    
    // Initialize wide mode state
    const getWideMode = () => {
        return localStorage.getItem('wide-mode') === 'true';
    };
    
    const setWideMode = (enabled: boolean) => {
        console.log('Setting wide mode to:', enabled);
        if (enabled) {
            document.body.classList.add('wide-mode');
            localStorage.setItem('wide-mode', 'true');
        } else {
            document.body.classList.remove('wide-mode');
            localStorage.setItem('wide-mode', 'false');
        }
        
        // Show/hide floating close button
        const floatingButton = document.querySelector('#wide-mode-close') as HTMLElement;
        if (floatingButton) {
            floatingButton.style.display = enabled ? 'block' : 'none';
        }
        
        updateSidebarButton();
    };
    
    // Create sidebar toggle button
    const createSidebarButton = () => {
        // Try to find the sidebar menu - Stack theme uses ol.menu for navigation
        let insertTarget = document.querySelector('#main-menu') || 
                          document.querySelector('.left-sidebar .menu') || 
                          document.querySelector('aside .menu') ||
                          document.querySelector('.left-sidebar ol') ||
                          document.querySelector('aside ol') ||
                          document.querySelector('.left-sidebar') ||
                          document.querySelector('aside');
        
        if (!insertTarget) {
            console.log('Sidebar container not found');
            return;
        }
        
        const wideButton = document.createElement('li');
        wideButton.id = 'wide-mode-toggle';
        wideButton.innerHTML = `
            <svg class="icon icon-tabler" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span>Wide Mode</span>
        `;
        wideButton.style.cursor = 'pointer';
        wideButton.title = 'Enable Wide Mode';
        
        // If we found an OL or UL, append to it; otherwise create one and append to the sidebar
        if (insertTarget.tagName === 'OL' || insertTarget.tagName === 'UL') {
            insertTarget.appendChild(wideButton);
        } else {
            // Create an OL if the target is the sidebar container itself (matching Stack theme structure)
            let menu = insertTarget.querySelector('ol.menu') || insertTarget.querySelector('ol') || insertTarget.querySelector('ul');
            if (!menu) {
                menu = document.createElement('ol');
                menu.className = 'menu';
                insertTarget.appendChild(menu);
            }
            menu.appendChild(wideButton);
        }
        
        // Add event listeners
        wideButton.addEventListener('click', () => {
            const currentState = getWideMode();
            setWideMode(!currentState);
        });
        
        // No hover effects - button stays consistent
        
        wideButton.addEventListener('mouseleave', () => {
            updateSidebarButton(); // Reset to default state
        });
        
        console.log('Sidebar button created');
    };
    
    // Update sidebar button appearance
    const updateSidebarButton = () => {
        const button = document.querySelector('#wide-mode-toggle') as HTMLElement;
        if (!button) return;
        
        const isWide = getWideMode();
        const svg = button.querySelector('svg');
        const span = button.querySelector('span');
        
        if (svg && span) {
            // Always show expand icon and "Wide Mode" text by default
            svg.innerHTML = `
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            `;
            span.textContent = 'Wide Mode';
        }
        
        button.classList.toggle('active', isWide);
        button.title = isWide ? 'Disable Wide Mode' : 'Enable Wide Mode';
    };
    
    // Create floating button
    const createFloatingButton = () => {
        const floatingButton = document.createElement('div');
        floatingButton.id = 'wide-mode-close';
        floatingButton.innerHTML = `
            <button>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21l-4.35-4.35"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                <span style="color: white;">Close</span>
            </button>
        `;
        floatingButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: none;
        `;
        
        // Style the button to match theme
        const button = floatingButton.querySelector('button');
        if (button) {
            button.style.cssText = `
                background: var(--card-background);
                border: 1px solid var(--card-border);
                border-radius: 8px;
                padding: 8px 12px;
                color: white;
                font-family: var(--base-font-family);
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: var(--shadow-l2), 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
            `;
            
            // Add hover effect for the button container
            button.addEventListener('mouseenter', () => {
                button.style.boxShadow = 'var(--shadow-l3), 0 6px 16px rgba(0, 0, 0, 0.2)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.boxShadow = 'var(--shadow-l2), 0 4px 12px rgba(0, 0, 0, 0.15)';
            });
        }
        
        document.body.appendChild(floatingButton);
        
        if (button) {
            // Click handler
            button.addEventListener('click', () => {
                setWideMode(false);
            });
            
            // No hover effects - button stays consistent
        }
        
        console.log('Floating button created');
    };
    
    // Initialize everything
    createSidebarButton();
    createFloatingButton();
    
    // Apply saved state
    if (getWideMode()) {
        setWideMode(true);
    }
    
    // Debug functions
    (window as any).toggleWideMode = () => {
        const currentState = getWideMode();
        setWideMode(!currentState);
    };
    
    (window as any).resetWideMode = () => {
        setWideMode(false);
    };
});