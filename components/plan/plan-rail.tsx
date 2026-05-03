'use client';

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme';
import { duration } from '@/lib/motion';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type NodeState = 'past' | 'current' | 'future';

type WeekNode = {
  state: NodeState;
  /** Absolute Y offset of the week row within the scrollable content. */
  offsetY: number;
};

type Props = {
  nodes: WeekNode[];
  /** Total height of the scrollable week-list content (used to draw the tail). */
  contentHeight: number;
};

// ------------------------------------------------------------------
// Constants — derived from design tokens
// ------------------------------------------------------------------

const NODE_SIZE = 10; // outer diameter (px)
const NODE_INNER = 5; // inner fill for "current" ring
const RAIL_X = 0; // rail sits at left:0 within the rail container
const RAIL_WIDTH = 1.5;

// ------------------------------------------------------------------
// PulsingRing — the "current week" node
// ------------------------------------------------------------------

function PulsingRing({ disabled }: { disabled: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (disabled) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: duration.long }),
        withTiming(1, { duration: duration.long }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: duration.long }),
        withTiming(0.5, { duration: duration.long }),
      ),
      -1,
      false,
    );
  }, [disabled, opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0 : opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        ringStyle,
      ]}
    />
  );
}

// ------------------------------------------------------------------
// Single node
// ------------------------------------------------------------------

function RailNode({ state, offsetY }: { state: NodeState; offsetY: number }) {
  const reduced = useReducedMotion();

  const nodeTop = offsetY - NODE_SIZE / 2;

  if (state === 'past') {
    return (
      <View
        style={[
          styles.node,
          { top: nodeTop, backgroundColor: colors.success },
        ]}
      />
    );
  }

  if (state === 'current') {
    return (
      <View style={[styles.nodeWrapper, { top: nodeTop }]}>
        {/* Pulse halo — behind the ring */}
        <PulsingRing disabled={reduced ?? false} />
        {/* Outer outlined ring */}
        <View style={styles.currentRingOuter}>
          {/* Inner fill dot */}
          <View style={styles.currentRingInner} />
        </View>
      </View>
    );
  }

  // future
  return (
    <View
      style={[
        styles.node,
        { top: nodeTop, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.borderSubtle },
      ]}
    />
  );
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

export function PlanRail({ nodes, contentHeight }: Props) {
  if (nodes.length === 0) return null;

  const firstY = nodes[0].offsetY;
  const lastY = nodes[nodes.length - 1].offsetY;

  // Find the current week index for splitting rail colour segments
  const currentIdx = nodes.findIndex((n) => n.state === 'current');

  // Y positions to split past / current / future segments
  const pastEndY = currentIdx > 0 ? nodes[currentIdx > 0 ? currentIdx : 0].offsetY : firstY;
  const currentY = currentIdx >= 0 ? nodes[currentIdx].offsetY : firstY;

  const railTotalHeight = contentHeight > 0 ? contentHeight : lastY + 40;

  // Heights for colour bands
  // Past: from firstY to current node Y
  const pastHeight = currentIdx > 0 ? currentY - firstY : 0;
  // Current: a short 24px segment centred on the current node (just visual continuity)
  const currentSegHeight = 24;
  // Future: from current node to bottom of content
  const futureStartY = currentY + currentSegHeight / 2;
  const futureHeight = railTotalHeight - futureStartY;

  return (
    <View
      style={[styles.container, { height: railTotalHeight }]}
      pointerEvents="none"
    >
      {/* ---- Rail segments ---- */}

      {/* Background rail (full height, borderSubtle) */}
      <View
        style={[
          styles.railSegment,
          {
            top: firstY,
            height: Math.max(0, railTotalHeight - firstY),
            backgroundColor: colors.borderSubtle,
          },
        ]}
      />

      {/* Past segment — sage success */}
      {pastHeight > 0 && (
        <View
          style={[
            styles.railSegment,
            {
              top: firstY,
              height: pastHeight,
              backgroundColor: colors.success,
              opacity: 0.55,
            },
          ]}
        />
      )}

      {/* Current segment — primary, short bridge through the current node */}
      {currentIdx >= 0 && (
        <View
          style={[
            styles.railSegment,
            {
              top: currentY - currentSegHeight / 2,
              height: currentSegHeight,
              backgroundColor: colors.primary,
              opacity: 0.75,
            },
          ]}
        />
      )}

      {/* ---- Nodes ---- */}
      {nodes.map((node, i) => (
        <RailNode key={i} state={node.state} offsetY={node.offsetY} />
      ))}
    </View>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: NODE_SIZE,
  },
  railSegment: {
    position: 'absolute',
    left: (NODE_SIZE - RAIL_WIDTH) / 2,
    width: RAIL_WIDTH,
  },
  node: {
    position: 'absolute',
    left: 0,
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
  },
  nodeWrapper: {
    position: 'absolute',
    left: 0,
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: colors.primary,
  },
  currentRingOuter: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRingInner: {
    width: NODE_INNER,
    height: NODE_INNER,
    borderRadius: NODE_INNER / 2,
    backgroundColor: colors.primary,
  },
});
