import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContactlessHero from '@/components/learning/contactless-hero';
import { enter, stagger } from '@/lib/motion';
import { colors } from '@/lib/theme';

const FRAUNCES_REGULAR = 'Fraunces_400Regular';
const FRAUNCES_LIGHT_ITALIC = 'Fraunces_300Light_Italic';
const ONEST_REGULAR = 'Onest_400Regular';
const ONEST_MEDIUM = 'Onest_500Medium';

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const fade = (delay: number) =>
    reduced ? enter.fade(0) : enter.fadeUp(delay);

  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={[styles.back, { top: insets.top + 8 }]}
      >
        <ChevronLeft size={24} color={colors.text} strokeWidth={1.75} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero zone */}
        <View style={[styles.hero, { paddingTop: insets.top + 56 }]}>
          <Animated.View entering={fade(stagger(0))}>
            <ContactlessHero height={220} />
          </Animated.View>

          <Animated.Text style={styles.eyebrow} entering={fade(stagger(1, 60))}>
            PAYING TODAY
          </Animated.Text>

          <Animated.Text style={styles.headline} entering={fade(stagger(2, 60))}>
            The chip that pays for you
          </Animated.Text>

          <Animated.Text style={styles.deck} entering={fade(stagger(3, 60))}>
            A short guide to contactless payment, the small radio inside your
            phone and card that has replaced the swipe at most registers.
          </Animated.Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Section heading="What it is" delay={stagger(4, 60)} fade={fade}>
            Inside most new debit and credit cards is a thin antenna and a chip.
            The same chip lives inside your phone if you set up Apple Pay or
            Google Pay. When you hold it close to a payment reader, the two
            devices talk over a few inches of air. No internet. No swipe. The
            reader pulls the amount it needs and lets you go. The whole
            exchange takes about a second.
          </Section>

          <Section
            heading="What it looks like"
            delay={stagger(5, 60)}
            fade={fade}
          >
            Look for a small symbol that resembles four curved lines, like a
            sideways wifi mark. You will see it on card readers at the grocery
            store, on gas pumps, on subway turnstiles, on the side of a vending
            machine, on the counter at Starbucks. People hold a phone or card
            an inch above the symbol for a moment, then walk away. There is
            often a soft beep, a green check, or a quick buzz from the phone.
          </Section>

          {/* Pull quote */}
          <Animated.View style={styles.quoteWrap} entering={fade(stagger(6, 60))}>
            <View style={styles.quoteRule} />
            <Text style={styles.quote}>
              Hold it close, wait for the beep, and the transaction is done
              before your hand is back at your side.
            </Text>
          </Animated.View>

          <Section
            heading="What the merchant actually sees"
            delay={stagger(7, 60)}
            fade={fade}
          >
            Your card number is not handed to the cashier or the store's
            computer. The chip sends a one-time code, called a token, that
            stands in for your account for that single purchase. If the store
            is later hacked, that token is useless. This is worth knowing once
            and then setting aside. It is the quiet reason banks have pushed
            this method so hard.
          </Section>

          <Section
            heading="When it does not work"
            delay={stagger(8, 60)}
            fade={fade}
          >
            Sometimes the reader is old, or the signal misses. The fix is the
            same as it has always been. Say "card," and insert the card into
            the slot at the bottom of the reader, chip first. For purchases
            under about fifty dollars, you usually will not be asked for a PIN
            or a signature. For larger ones, you will.
          </Section>

          <Animated.Text style={styles.closing} entering={fade(stagger(9, 60))}>
            The first time feels strange; by the third time, it is the part of
            the day you stop noticing.
          </Animated.Text>

          <Animated.View style={styles.signoffWrap} entering={fade(stagger(10, 60))}>
            <View style={styles.signoffRule} />
            <Text style={styles.signoff}>END OF LESSON</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

type SectionProps = {
  heading: string;
  delay: number;
  fade: (delay: number) => ReturnType<typeof enter.fade>;
  children: React.ReactNode;
};

function Section({ heading, delay, fade, children }: SectionProps) {
  return (
    <Animated.View style={styles.section} entering={fade(delay)}>
      <Text style={styles.h2}>{heading}</Text>
      <Text style={styles.para}>{children}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  back: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  eyebrow: {
    marginTop: 28,
    fontFamily: ONEST_MEDIUM,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#5B7A99',
  },
  headline: {
    marginTop: 16,
    fontFamily: FRAUNCES_REGULAR,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.text,
    maxWidth: 320,
  },
  deck: {
    marginTop: 18,
    fontFamily: ONEST_REGULAR,
    fontSize: 17,
    lineHeight: 26,
    color: '#3A4A5C',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginTop: 24,
  },
  h2: {
    fontFamily: FRAUNCES_REGULAR,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
    marginBottom: 12,
    marginTop: 16,
  },
  para: {
    fontFamily: ONEST_REGULAR,
    fontSize: 17,
    lineHeight: 28,
    color: '#1A2330',
  },
  quoteWrap: {
    marginTop: 48,
    marginBottom: 8,
  },
  quoteRule: {
    width: 24,
    height: 1,
    backgroundColor: '#5B7A99',
    marginBottom: 20,
  },
  quote: {
    fontFamily: FRAUNCES_LIGHT_ITALIC,
    fontSize: 24,
    lineHeight: 32,
    color: '#2C5282',
  },
  closing: {
    marginTop: 32,
    fontFamily: ONEST_REGULAR,
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
  },
  signoffWrap: {
    marginTop: 56,
    alignItems: 'center',
  },
  signoffRule: {
    width: 32,
    height: 1,
    backgroundColor: '#5B7A99',
    marginBottom: 24,
  },
  signoff: {
    fontFamily: ONEST_MEDIUM,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#5B7A99',
  },
});
