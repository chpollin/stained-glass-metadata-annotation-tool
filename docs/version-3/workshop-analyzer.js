/**
 * Workshop and Artist Connection Analyzer
 * Infers workshops and artist connections from CVMA stained glass data
 */

class WorkshopAnalyzer {
    constructor(items) {
        this.items = items;
        this.workshops = new Map();
        this.connections = [];
        this.locationPeriodGroups = new Map();
    }

    /**
     * Analyze all items to identify potential workshops
     */
    analyzeWorkshops() {
        console.log('🔍 Starting workshop analysis...');
        const startTime = Date.now();

        // Group items by location and time period
        Object.values(this.items).forEach(item => {
            if (!item.location || !item.periodNormalized) return;

            const decade = Math.floor(item.periodNormalized.year / 10) * 10;
            const locationId = item.location.geonameId || item.location.uri;
            const workshopKey = `${locationId}_${decade}s`;

            if (!this.locationPeriodGroups.has(workshopKey)) {
                this.locationPeriodGroups.set(workshopKey, {
                    id: workshopKey,
                    location: locationId,
                    period: `${decade}s`,
                    items: [],
                    subjects: new Set(),
                    styles: new Set(),
                    dateRange: { min: 9999, max: 0 }
                });
            }

            const group = this.locationPeriodGroups.get(workshopKey);
            group.items.push(item);

            // Track subjects (handle both array and single object)
            if (item.subject) {
                const subjects = Array.isArray(item.subject) ? item.subject : [item.subject];
                subjects.forEach(subj => {
                    if (subj && subj.code) {
                        group.subjects.add(subj.code);
                    }
                });
            }

            // Track date range
            if (item.periodNormalized.year < group.dateRange.min) {
                group.dateRange.min = item.periodNormalized.year;
            }
            if (item.periodNormalized.year > group.dateRange.max) {
                group.dateRange.max = item.periodNormalized.year;
            }
        });

        // Identify likely workshops (groups with multiple works)
        this.locationPeriodGroups.forEach((group, key) => {
            if (group.items.length >= 3) { // At least 3 works to be considered a workshop
                this.workshops.set(key, {
                    id: key,
                    name: this.generateWorkshopName(group),
                    location: group.location,
                    period: group.period,
                    workCount: group.items.length,
                    items: group.items,
                    subjects: Array.from(group.subjects),
                    dateRange: group.dateRange,
                    connections: []
                });
            }
        });

        const elapsed = Date.now() - startTime;
        console.log(`✅ Found ${this.workshops.size} workshops from ${this.locationPeriodGroups.size} location-period groups in ${elapsed}ms`);

        return this.workshops;
    }

    /**
     * Generate a descriptive name for a workshop
     */
    generateWorkshopName(group) {
        const locationName = this.getLocationName(group.location);
        return `${locationName} Workshop (${group.period})`;
    }

    /**
     * Get location name from ID
     */
    getLocationName(locationId) {
        // Find an item with this location to get more details
        const sampleItem = Object.values(this.items).find(
            item => item.location &&
            (item.location.geonameId === locationId || item.location.uri === locationId)
        );

        if (sampleItem && sampleItem.label) {
            // Try to extract location from label if it contains location info
            const locationPatterns = [
                /(?:aus|from|de|von)\s+(.+?)(?:\s*\(|$)/i,
                /,\s*([^,]+)$/,
                /\bin\s+(.+?)(?:\s*\(|$)/i
            ];

            for (const pattern of locationPatterns) {
                const match = sampleItem.label.match(pattern);
                if (match) return match[1].trim();
            }
        }

        // Fallback to ID-based name
        return `Location ${locationId.split('/').pop()}`;
    }

    /**
     * Find connections between workshops
     */
    findConnections() {
        console.log('🔗 Finding workshop connections...');
        const workshopArray = Array.from(this.workshops.values());
        let comparisons = 0;
        let nullConnections = 0;

        workshopArray.forEach((workshop1, i) => {
            workshopArray.slice(i + 1).forEach(workshop2 => {
                comparisons++;
                const connection = this.calculateConnection(workshop1, workshop2);
                if (connection && connection.strength > 0) {
                    this.connections.push(connection);
                    workshop1.connections.push(connection);
                    workshop2.connections.push(connection);
                } else if (!connection) {
                    nullConnections++;
                }
            });
        });

        console.log(`📊 Analyzed ${comparisons} pairs, found ${this.connections.length} connections (${nullConnections} null)`);
        if (this.connections.length > 0) {
            const avgStrength = Math.round(
                this.connections.reduce((sum, c) => sum + c.strength, 0) / this.connections.length
            );
            console.log(`💪 Average connection strength: ${avgStrength}`);
        }

        return this.connections;
    }

    /**
     * Calculate connection strength between two workshops
     */
    calculateConnection(workshop1, workshop2) {
        let strength = 0;
        const reasons = [];

        // Temporal proximity (overlapping or close time periods)
        const timeDiff = Math.abs(
            (workshop1.dateRange.min + workshop1.dateRange.max) / 2 -
            (workshop2.dateRange.min + workshop2.dateRange.max) / 2
        );

        if (timeDiff < 20) { // Within 20 years
            strength += 30;
            reasons.push('Contemporary workshops');
        }
        // Removed the 50-year threshold to reduce connection noise

        // Shared subjects/iconography
        const sharedSubjects = workshop1.subjects.filter(s =>
            workshop2.subjects.includes(s)
        );
        if (sharedSubjects.length > 0) {
            strength += sharedSubjects.length * 10;
            reasons.push(`${sharedSubjects.length} shared subjects`);
        }

        // Geographic proximity (if we had coordinates, we could calculate distance)
        if (workshop1.location === workshop2.location) {
            strength += 40;
            reasons.push('Same location');
        }

        // Shared parent objects (windows/ensembles)
        const sharedParents = new Set();
        workshop1.items.forEach(item1 => {
            workshop2.items.forEach(item2 => {
                if (item1.elementOf === item2.elementOf) {
                    sharedParents.add(item1.elementOf);
                }
            });
        });

        if (sharedParents.size > 0) {
            strength += sharedParents.size * 25;
            reasons.push(`${sharedParents.size} shared window(s)`);
        }

        // Only return a connection if there's actual strength
        if (strength > 0) {
            return {
                source: workshop1.id,
                target: workshop2.id,
                strength: Math.min(strength, 100), // Cap at 100
                reasons: reasons,
                type: this.getConnectionType(strength, reasons)
            };
        }

        return null;
    }

    /**
     * Determine connection type based on strength and reasons
     */
    getConnectionType(strength, reasons) {
        if (reasons.includes('Same location') && reasons.includes('Contemporary workshops')) {
            return 'successor'; // Likely successor workshop
        }
        if (reasons.some(r => r.includes('shared window'))) {
            return 'collaboration'; // Worked on same project
        }
        if (reasons.some(r => r.includes('shared subjects'))) {
            return 'influence'; // Stylistic influence
        }
        return 'proximity'; // General connection
    }

    /**
     * Get workshop statistics
     */
    getStatistics() {
        const stats = {
            totalWorkshops: this.workshops.size,
            totalConnections: this.connections.length,
            periodDistribution: {},
            locationDistribution: {},
            largestWorkshops: [],
            strongestConnections: []
        };

        // Period distribution
        this.workshops.forEach(workshop => {
            const century = Math.floor(parseInt(workshop.period) / 100) * 100;
            stats.periodDistribution[century] = (stats.periodDistribution[century] || 0) + 1;
        });

        // Location distribution
        this.workshops.forEach(workshop => {
            const location = this.getLocationName(workshop.location);
            stats.locationDistribution[location] = (stats.locationDistribution[location] || 0) + 1;
        });

        // Largest workshops
        stats.largestWorkshops = Array.from(this.workshops.values())
            .sort((a, b) => b.workCount - a.workCount)
            .slice(0, 10)
            .map(w => ({
                name: w.name,
                workCount: w.workCount,
                period: w.period
            }));

        // Strongest connections
        stats.strongestConnections = this.connections
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 10)
            .map(c => ({
                source: this.workshops.get(c.source).name,
                target: this.workshops.get(c.target).name,
                strength: c.strength,
                type: c.type,
                reasons: c.reasons
            }));

        return stats;
    }

    /**
     * Export workshop data for visualization
     */
    exportForVisualization() {
        const nodes = Array.from(this.workshops.values()).map(w => {
            // Extract year from period string (e.g., "1370s" -> 1370)
            const yearMatch = w.period.match(/(\d+)/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 1300;
            const century = Math.floor(year / 100);

            return {
                id: w.id,
                label: w.name,
                value: w.workCount,
                group: century, // Group by century (12, 13, 14, 15, etc.)
                title: `${w.name}\n${w.workCount} works\n${w.subjects.length} subjects`,
                x: Math.random() * 1000, // Random initial positions
                y: Math.random() * 1000
            };
        });

        const edges = this.connections.map(c => ({
            from: c.source,
            to: c.target,
            value: c.strength,
            title: c.reasons.join(', '),
            color: this.getConnectionColor(c.type),
            dashes: c.type === 'influence' // Dashed for influence
        }));

        return { nodes, edges };
    }

    /**
     * Get color for connection type
     */
    getConnectionColor(type) {
        const colors = {
            successor: '#2ecc71',     // Green - direct succession
            collaboration: '#3498db',  // Blue - worked together
            influence: '#9b59b6',      // Purple - stylistic influence
            proximity: '#95a5a6'       // Gray - general proximity
        };
        return colors[type] || '#95a5a6';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopAnalyzer;
}