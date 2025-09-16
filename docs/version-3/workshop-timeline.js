/**
 * Workshop Timeline Visualization
 * Displays medieval stained glass workshops on a timeline with location-based swim lanes
 */

let allItems = {};
let analyzer = null;
let timelineData = null;
let selectedWorkshop = null;
let showConnections = true;

// Timeline configuration
const TIMELINE_CONFIG = {
    startYear: 1100,
    endYear: 1600,
    laneHeight: 70,
    boxHeight: 30,
    boxPadding: 5,
    minBoxWidth: 40,
    timelineWidth: 1400,
    leftMargin: 60
};

// Load and visualize data
async function loadAndVisualize() {
    console.log('📊 Loading timeline data...');

    try {
        // Load the processed data
        const response = await fetch('data/cvma-processed.json');
        const data = await response.json();
        allItems = data.items;
        console.log(`✅ Loaded ${Object.keys(allItems).length} items`);

        // Create analyzer and run analysis
        analyzer = new WorkshopAnalyzer(allItems);
        analyzer.analyzeWorkshops();
        analyzer.findConnections();
        console.log(`🔍 Found ${analyzer.workshops.size} workshops`);

        // Process data for timeline
        processTimelineData();

        // Render timeline
        renderTimeline();

        // Update statistics
        updateStatistics();

        console.log('✨ Timeline visualization complete!');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Error loading data: ' + error.message);
    }
}

// Process workshop data for timeline visualization
function processTimelineData() {
    const minWorks = parseInt(document.getElementById('minWorks').value);

    // Group workshops by location
    const locationGroups = new Map();

    analyzer.workshops.forEach(workshop => {
        if (workshop.workCount < minWorks) return;

        const locationName = getLocationDisplayName(workshop);

        if (!locationGroups.has(locationName)) {
            locationGroups.set(locationName, []);
        }

        locationGroups.get(locationName).push({
            ...workshop,
            displayLocation: locationName,
            startYear: workshop.dateRange.min,
            endYear: workshop.dateRange.max,
            century: Math.floor(workshop.dateRange.min / 100)
        });
    });

    // Sort locations by earliest workshop
    const sortedLocations = Array.from(locationGroups.entries())
        .sort((a, b) => {
            const minYearA = Math.min(...a[1].map(w => w.startYear));
            const minYearB = Math.min(...b[1].map(w => w.startYear));
            return minYearA - minYearB;
        });

    timelineData = {
        locations: sortedLocations,
        workshops: Array.from(analyzer.workshops.values()),
        connections: analyzer.connections
    };

    console.log(`📍 Organized into ${sortedLocations.length} locations`);
}

// Get display name for location
function getLocationDisplayName(workshop) {
    // Try to extract a meaningful name from the workshop items
    if (workshop.items && workshop.items.length > 0) {
        const sampleLabel = workshop.items[0].label;

        // Common patterns for location extraction
        const patterns = [
            /(?:aus|from|de|von)\s+([^,\(]+)/i,
            /,\s*([^,\(]+)$/,
            /\bin\s+([^,\(]+)/i,
            /\(([^)]+)\)/
        ];

        for (const pattern of patterns) {
            const match = sampleLabel.match(pattern);
            if (match && match[1].length > 2) {
                return match[1].trim();
            }
        }
    }

    // Fallback to location ID
    const locationId = workshop.location.split('/').pop();
    return `Location ${locationId}`;
}

// Render the timeline
function renderTimeline() {
    renderYearAxis();
    renderGridLines();
    renderSwimLanes();
    if (showConnections) {
        renderConnections();
    }
}

// Render year axis
function renderYearAxis() {
    const yearAxis = document.getElementById('yearAxis');
    yearAxis.innerHTML = '';

    // Create decade markers
    for (let year = TIMELINE_CONFIG.startYear; year <= TIMELINE_CONFIG.endYear; year += 50) {
        const marker = document.createElement('div');
        marker.textContent = year;
        yearAxis.appendChild(marker);
    }
}

// Render grid lines
function renderGridLines() {
    const gridLines = document.getElementById('gridLines');
    gridLines.innerHTML = '';

    const totalYears = TIMELINE_CONFIG.endYear - TIMELINE_CONFIG.startYear;

    // Add decade lines
    for (let year = TIMELINE_CONFIG.startYear; year <= TIMELINE_CONFIG.endYear; year += 10) {
        const line = document.createElement('div');
        line.className = 'decade-line';
        const position = ((year - TIMELINE_CONFIG.startYear) / totalYears) * 100;
        line.style.left = `${position}%`;

        if (year % 50 === 0) {
            line.style.borderColor = '#adb5bd';
            line.style.borderWidth = '2px';
        }

        gridLines.appendChild(line);
    }
}

// Render swim lanes with workshops
function renderSwimLanes() {
    const swimLanes = document.getElementById('swimLanes');
    swimLanes.innerHTML = '';

    if (!timelineData) return;

    const totalYears = TIMELINE_CONFIG.endYear - TIMELINE_CONFIG.startYear;
    let laneIndex = 0;

    timelineData.locations.forEach(([locationName, workshops]) => {
        const lane = document.createElement('div');
        lane.className = 'location-lane';
        lane.style.height = `${TIMELINE_CONFIG.laneHeight}px`;

        // Add location label
        const label = document.createElement('div');
        label.className = 'location-label';
        label.textContent = locationName;
        label.title = locationName;
        lane.appendChild(label);

        // Sort workshops by start year within lane
        workshops.sort((a, b) => a.startYear - b.startYear);

        // Position workshops to avoid overlaps
        const rows = [];

        workshops.forEach(workshop => {
            // Find available row
            let rowIndex = 0;
            let placed = false;

            while (!placed) {
                if (!rows[rowIndex]) {
                    rows[rowIndex] = [];
                }

                // Check if workshop fits in this row
                const overlap = rows[rowIndex].some(w =>
                    !(workshop.endYear < w.startYear || workshop.startYear > w.endYear)
                );

                if (!overlap) {
                    rows[rowIndex].push(workshop);
                    placed = true;
                } else {
                    rowIndex++;
                }
            }

            // Create workshop box
            const box = document.createElement('div');
            box.className = `workshop-box century-${workshop.century}`;
            box.textContent = workshop.name;
            box.title = `${workshop.name}\n${workshop.workCount} works\n${workshop.startYear}-${workshop.endYear}`;

            // Calculate position
            const startPercent = ((workshop.startYear - TIMELINE_CONFIG.startYear) / totalYears) * 100;
            const widthPercent = ((workshop.endYear - workshop.startYear) / totalYears) * 100;

            box.style.left = `${startPercent}%`;
            box.style.width = `${Math.max(widthPercent, 3)}%`; // Minimum width for visibility
            box.style.top = `${10 + rowIndex * (TIMELINE_CONFIG.boxHeight + TIMELINE_CONFIG.boxPadding)}px`;
            box.style.height = `${TIMELINE_CONFIG.boxHeight}px`;

            // Add click handler
            box.onclick = () => selectWorkshop(workshop);

            // Add hover handler
            box.onmouseenter = (e) => showTooltip(e, workshop);
            box.onmouseleave = () => hideTooltip();

            box.dataset.workshopId = workshop.id;
            lane.appendChild(box);
        });

        // Adjust lane height if needed
        const neededHeight = 20 + rows.length * (TIMELINE_CONFIG.boxHeight + TIMELINE_CONFIG.boxPadding);
        if (neededHeight > TIMELINE_CONFIG.laneHeight) {
            lane.style.height = `${neededHeight}px`;
        }

        swimLanes.appendChild(lane);
        laneIndex++;
    });
}

// Render connections between workshops
function renderConnections() {
    const svg = document.getElementById('connectionsSvg');
    svg.innerHTML = '';

    if (!timelineData || !showConnections) return;

    const connectionType = document.getElementById('connectionType').value;

    // Get positions of all workshop boxes
    const workshopPositions = new Map();
    document.querySelectorAll('.workshop-box').forEach(box => {
        const rect = box.getBoundingClientRect();
        const containerRect = box.parentElement.parentElement.getBoundingClientRect();
        workshopPositions.set(box.dataset.workshopId, {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        });
    });

    // Draw connections
    timelineData.connections.forEach(connection => {
        if (connectionType !== 'all' && !matchesConnectionFilter(connection, connectionType)) {
            return;
        }

        const fromPos = workshopPositions.get(connection.source);
        const toPos = workshopPositions.get(connection.target);

        if (fromPos && toPos) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Create curved path
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2 - 20;

            path.setAttribute('d', `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`);
            path.setAttribute('class', 'connection-line');
            path.setAttribute('stroke-opacity', Math.min(connection.strength / 100, 0.5));

            svg.appendChild(path);
        }
    });
}

// Check if connection matches filter
function matchesConnectionFilter(connection, filter) {
    switch (filter) {
        case 'contemporary':
            return connection.reasons.some(r => r.includes('Contemporary'));
        case 'location':
            return connection.reasons.some(r => r.includes('Same location'));
        case 'subjects':
            return connection.reasons.some(r => r.includes('shared subjects'));
        default:
            return true;
    }
}

// Select a workshop
function selectWorkshop(workshop) {
    // Clear previous selection
    document.querySelectorAll('.workshop-box.selected').forEach(box => {
        box.classList.remove('selected');
    });

    // Highlight selected workshop
    const box = document.querySelector(`[data-workshop-id="${workshop.id}"]`);
    if (box) {
        box.classList.add('selected');
    }

    selectedWorkshop = workshop;

    // Show workshop details
    const detailsDiv = document.getElementById('selectedWorkshop');
    detailsDiv.innerHTML = `
        <div class="workshop-details">
            <h3>${workshop.name}</h3>
            <p><strong>Period:</strong> ${workshop.startYear}-${workshop.endYear}</p>
            <p><strong>Works:</strong> ${workshop.workCount}</p>
            <p><strong>Subjects:</strong> ${workshop.subjects.length}</p>
            <p><strong>Connections:</strong> ${workshop.connections.length}</p>
        </div>
    `;

    // Highlight connections
    highlightConnections(workshop);
}

// Highlight connections for selected workshop
function highlightConnections(workshop) {
    // Clear previous highlights
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('highlighted');
    });

    // Highlight relevant connections
    const svg = document.getElementById('connectionsSvg');
    const paths = svg.querySelectorAll('path');

    workshop.connections.forEach(conn => {
        // Would need to track which path belongs to which connection
        // This is simplified for now
    });
}

// Show tooltip
function showTooltip(event, workshop) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = `
        <strong>${workshop.name}</strong><br>
        ${workshop.workCount} works<br>
        ${workshop.startYear}-${workshop.endYear}<br>
        ${workshop.subjects.length} subjects
    `;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
}

// Hide tooltip
function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

// Update statistics
function updateStatistics() {
    if (!timelineData) return;

    document.getElementById('workshopCount').textContent = timelineData.workshops.length;
    document.getElementById('locationCount').textContent = timelineData.locations.length;

    const minYear = Math.min(...timelineData.workshops.map(w => w.dateRange.min));
    const maxYear = Math.max(...timelineData.workshops.map(w => w.dateRange.max));
    document.getElementById('timeSpan').textContent = `${minYear}-${maxYear}`;
}

// Filter by century
function filterByCentury() {
    const century = document.getElementById('centuryFilter').value;

    if (!century) {
        document.querySelectorAll('.workshop-box').forEach(box => {
            box.style.display = 'block';
        });
    } else {
        document.querySelectorAll('.workshop-box').forEach(box => {
            const boxCentury = Array.from(box.classList)
                .find(c => c.startsWith('century-'))
                ?.replace('century-', '');

            box.style.display = boxCentury === century ? 'block' : 'none';
        });
    }
}

// Toggle connections
function toggleConnections() {
    showConnections = !showConnections;

    if (showConnections) {
        renderConnections();
    } else {
        document.getElementById('connectionsSvg').innerHTML = '';
    }
}

// Update connections based on filter
function updateConnections() {
    if (showConnections) {
        renderConnections();
    }
}

// Reset view
function resetView() {
    // Clear selection
    selectedWorkshop = null;
    document.querySelectorAll('.workshop-box.selected').forEach(box => {
        box.classList.remove('selected');
    });

    // Reset filters
    document.getElementById('centuryFilter').value = '';
    document.getElementById('connectionType').value = 'all';

    // Re-render
    if (timelineData) {
        renderTimeline();
    }
}

// Export data
function exportData() {
    if (!timelineData) {
        alert('Please load data first');
        return;
    }

    const exportData = {
        generated: new Date().toISOString(),
        workshops: timelineData.workshops,
        locations: Array.from(timelineData.locations.entries()).map(([name, workshops]) => ({
            name,
            workshopCount: workshops.length,
            timeRange: {
                min: Math.min(...workshops.map(w => w.startYear)),
                max: Math.max(...workshops.map(w => w.endYear))
            }
        })),
        connections: timelineData.connections
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-timeline-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Workshop Timeline Visualization ready');
    console.log('📌 Click "Load Timeline" to begin');
});