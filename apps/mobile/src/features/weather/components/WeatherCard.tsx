import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherContext } from '@know-your-route/types';
import { Card, Badge } from '../../../components';
import { theme } from '../../../theme';
import { CloudSun, Eye, Wind, Droplets } from 'lucide-react-native';

interface WeatherCardProps {
  weather: WeatherContext;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CloudSun size={20} color={theme.colors.cyan[500]} />
          <Text style={styles.title}>Weather Exposure</Text>
        </View>
        <Badge
          label={`${weather.temperatureCelsius}°C • ${weather.dominantCondition}`}
          variant="info"
        />
      </View>

      <Text style={styles.summary}>{weather.summary}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Eye size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metricText}>Visibility: {weather.visibilityKm} km</Text>
        </View>

        <View style={styles.metricItem}>
          <Droplets size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metricText}>Rain: {weather.precipitationProbability}%</Text>
        </View>

        <View style={styles.metricItem}>
          <Wind size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metricText}>Wind: {weather.windSpeedKmh} km/h</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
});
