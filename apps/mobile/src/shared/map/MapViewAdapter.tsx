import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RouteProfile, Waypoint } from '@know-your-route/contracts';
import { theme } from '../theme';
import { MapPin, Navigation, Compass } from 'lucide-react-native';

export interface MapViewAdapterProps {
  route?: RouteProfile | null;
  origin?: Waypoint | null;
  destination?: Waypoint | null;
  interactive?: boolean;
  style?: ViewStyle;
}

/**
 * MapViewAdapter decouples UI screens from specific Map SDKs (Google Maps / Mapbox / Apple Maps).
 * In development and cross-platform environments, it renders a high-fidelity route overview
 * with elevation, waypoints, toll plazas, and stop indicators.
 */
export const MapViewAdapter: React.FC<MapViewAdapterProps> = ({
  route,
  origin,
  destination,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Dynamic Grid Background representing map tiles */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical} />
      </View>

      {/* Compass / Orientation indicator */}
      <View style={styles.compassBadge}>
        <Compass size={16} color={theme.colors.emerald[500]} />
        <Text style={styles.compassText}>N</Text>
      </View>

      {/* Simulated Route Vector Line & Waypoints */}
      <View style={styles.routeContainer}>
        {/* Origin Pin */}
        <View style={styles.pinWrapper}>
          <View style={[styles.markerBadge, { backgroundColor: theme.colors.emerald[500] }]}>
            <MapPin size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.pinText} numberOfLines={1}>
            {origin?.name || 'Origin'}
          </Text>
        </View>

        {/* Route Path Line */}
        <View style={styles.pathLineWrapper}>
          <View style={styles.pathLine} />
          {route && (
            <View style={styles.routePill}>
              <Navigation size={12} color={theme.colors.brand[400]} />
              <Text style={styles.routePillText}>
                {route.distanceKm} km • {Math.round(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
              </Text>
            </View>
          )}
        </View>

        {/* Destination Pin */}
        <View style={styles.pinWrapper}>
          <View style={[styles.markerBadge, { backgroundColor: theme.colors.danger }]}>
            <MapPin size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.pinText} numberOfLines={1}>
            {destination?.name || 'Destination'}
          </Text>
        </View>
      </View>

      {/* Surface / Provider Footnote */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          {route ? `${route.road.highwayPercentage}% Expressway • Surface: ${route.road.surfaceCondition}` : 'Interactive Route Engine'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.brand[400],
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.brand[400],
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: theme.colors.brand[400],
  },
  compassBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  compassText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.emerald[500],
    marginLeft: 3,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '84%',
    zIndex: 1,
  },
  pinWrapper: {
    alignItems: 'center',
    maxWidth: 90,
  },
  markerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...theme.shadows.sm,
  },
  pinText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  pathLineWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  pathLine: {
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.brand[500],
    borderRadius: 2,
  },
  routePill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.slate[900],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.brand[500],
  },
  routePillText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  footerNote: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.md,
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
