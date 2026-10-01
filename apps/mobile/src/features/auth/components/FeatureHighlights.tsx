import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Car, IndianRupee, Coffee } from 'lucide-react-native';
import { welcomeTheme } from '../theme/welcome.theme';

type FeatureSize = 'compact' | 'wide';

interface FeatureHighlightsProps {
  size?: FeatureSize;
  maxWidth?: number;
}

interface FeatureItem {
  icon: React.ReactNode;
  line1: string;
  line2: string;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  size = 'compact',
  maxWidth,
}) => {
  const isWide = size === 'wide';
  const iconSize = isWide ? 22 : 18;
  const circleSize = isWide ? 48 : 40;
  const iconColor = welcomeTheme.colors.textOnHero;

  const features: FeatureItem[] = [
    {
      icon: <ShieldCheck size={iconSize} color={iconColor} strokeWidth={2} />,
      line1: 'AI-powered',
      line2: 'routes',
    },
    {
      icon: <Car size={iconSize} color={iconColor} strokeWidth={2} />,
      line1: 'Real-time',
      line2: 'alerts',
    },
    {
      icon: <IndianRupee size={iconSize} color={iconColor} strokeWidth={2} />,
      line1: 'Save on',
      line2: 'fuel, toll & time',
    },
    {
      icon: <Coffee size={iconSize} color={iconColor} strokeWidth={2} />,
      line1: 'Curated',
      line2: 'stops',
    },
  ];

  return (
    <View style={[styles.row, isWide && styles.rowWide, maxWidth ? { maxWidth } : null]}>
      {features.map((feature) => (
        <View key={feature.line1} style={styles.item}>
          <View
            style={[
              styles.iconCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          >
            {feature.icon}
          </View>
          <Text style={[styles.line, isWide && styles.lineWide]}>{feature.line1}</Text>
          <Text style={[styles.line, isWide && styles.lineWide]}>{feature.line2}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 28,
    width: '100%',
  },
  rowWide: {
    marginTop: 36,
    paddingHorizontal: 0,
    gap: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  iconCircle: {
    backgroundColor: welcomeTheme.colors.featureIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  line: {
    color: welcomeTheme.colors.textOnHero,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  lineWide: {
    fontSize: 11,
    lineHeight: 15,
  },
});
