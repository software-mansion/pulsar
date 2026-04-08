import React, { useEffect, useState, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useAnimatedReaction, useAnimatedRef, scrollTo } from 'react-native-reanimated';
import { usePostHog } from 'posthog-react-native';
import { Image as ExpoImage } from 'expo-image';

import Card from './Card';
import { ThemedText } from './themed-text';
import { Colors, Fonts } from '@/constants/theme';
import Button from './Button';
import { useFavourites } from '@/contexts/FavouritesContext';

import heartIcon from '@/assets/images/heart.svg';
import heartFillIcon from '@/assets/images/heart-fill.svg';

const IMAGE_HEIGHT = 160;

export interface PresetProps {
	title: string;
	subtitle: string;
	tags: string[];
	image: ImageSourcePropType;
	onPress: () => void;
	duration?: number;
	compact?: boolean;
}

function Preset({ title, subtitle, tags = [], image, onPress, duration, compact }: PresetProps) {
	duration = duration ? duration : 20;
	const posthog = usePostHog();
	const imageMeta = Image.resolveAssetSource(image);
	const imageAspectRatio =
		imageMeta?.width && imageMeta?.height ? imageMeta.width / imageMeta.height : undefined;
	const imageWidth = imageAspectRatio ? IMAGE_HEIGHT * imageAspectRatio : undefined;
	const effectiveRatio = duration ? Math.min(1, duration / 1000) : 1;

	const { isFavourite, toggleFavourite } = useFavourites();
	const favourite = isFavourite(title);

	const handleFavouritePress = () => {
		const nowFavourite = !favourite;
		toggleFavourite(title);
		posthog.capture(nowFavourite ? 'preset_favourited' : 'preset_unfavourited', {
			preset_name: title,
			tags,
		});
	};

	const [isPlaying, setIsPlaying] = useState(false);
	const [viewportWidth, setViewportWidth] = useState(0);
	const progress = useSharedValue(0);
	const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

	useAnimatedReaction(
		() => progress.value,
		(currentProgress) => {
			if (imageWidth && viewportWidth > 0 && currentProgress > 0) {
				const indicatorPosition = currentProgress * effectiveRatio * imageWidth;
				const scrollX = Math.max(0, indicatorPosition - viewportWidth / 2);
				scrollTo(scrollViewRef, scrollX, 0, false);
			}
		}
	);

	const handlePress = () => {
		if (isPlaying) {
			setIsPlaying(false);
			progress.value = withTiming(0, { duration: 200 });
			scrollViewRef.current?.scrollTo({ x: 0, animated: true });
			posthog.capture('preset_stopped', {
				preset_name: title,
				tags,
			});
		} else {
			setIsPlaying(true);
			onPress();
			posthog.capture('preset_played', {
				preset_name: title,
				tags,
				duration_ms: duration,
			});

			if (duration) {
				progress.value = 0;
				progress.value = withTiming(1, {
					duration,
					easing: Easing.linear,
				});

				setTimeout(() => {
					setIsPlaying(false);
					progress.value = withTiming(0, { duration: 200 });
					scrollViewRef.current?.scrollTo({ x: 0, animated: true });
				}, duration);
			}
		}
	};

	const animatedIndicatorStyle = useAnimatedStyle(() => {
		return {
			left: progress.value * effectiveRatio * (imageWidth ?? 1000),
		};
	});

	if (compact) {
		return (
			<Pressable onPress={handlePress}>
				<Card style={styles.cardCompact} enableAnimation={false}>
					<View style={styles.compactContainer}>
						<View style={styles.compactInfo}>
							<View style={styles.tagsContainerCompact}>
								{tags.map((tag, index) => (
									<View key={`${tag}-${index}`} style={styles.tagCompact}>
										<Text style={styles.tagTextCompact}>{tag}</Text>
									</View>
								))}
							</View>
							<ThemedText type="subtitle" style={styles.titleCompact}>{title}</ThemedText>
						</View>
						<Pressable onPress={handleFavouritePress} style={styles.compactHeartButton} hitSlop={8}>
							<ExpoImage source={favourite ? heartFillIcon : heartIcon} style={styles.heartIcon} />
						</Pressable>
						<Text style={styles.compactPlayIcon}>{isPlaying ? '■' : '▶'}</Text>
					</View>
				</Card>
			</Pressable>
		);
	}

	return (
		<Card style={styles.card} enableAnimation={false}>
			<View style={styles.container}>
				<View style={styles.tagsRow}>
					<View style={styles.tagsContainer}>
						{tags.map((tag, index) => (
							<View
								key={`${tag}-${index}`}
								style={styles.tag}
							>
								<Text style={styles.tagText}>{tag}</Text>
							</View>
						))}
					</View>
					<Pressable onPress={handleFavouritePress} hitSlop={8}>
						<ExpoImage source={favourite ? heartFillIcon : heartIcon} style={styles.heartIcon} />
					</Pressable>
				</View>

				<ThemedText type="subtitle" style={styles.title}>
					{title}
				</ThemedText>
				<ThemedText style={styles.description}>{subtitle}</ThemedText>

				<View 
					style={styles.border}
					onLayout={(event) => {
						const { width } = event.nativeEvent.layout;
						setViewportWidth(width);
					}}
				>
					<ScrollView
						ref={scrollViewRef}
						horizontal
						bounces={false}
						scrollEnabled={true}
						style={styles.imagesScroll}
						contentContainerStyle={styles.imagesContent}
					>
						<View style={{ position: 'relative', height: IMAGE_HEIGHT, width: imageWidth }}>
							<Image
								source={image}
								style={[
									styles.image,
									imageWidth ? { width: imageWidth } : undefined,
								]}
								resizeMode="contain"
							/>
							{isPlaying && (
								<Animated.View style={[styles.playIndicator, animatedIndicatorStyle]} />
							)}
						</View>
					</ScrollView>
				</View>

				<Button
					label={isPlaying ? 'Stop' : 'Play'}
					showIcon={isPlaying ? 'stop' : 'play'}
					onClick={handlePress}
					disableHaptics
				/>

			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {
		paddingVertical: 15,
	},
	container: {
		gap: 5,
	},
	tagsContainer: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	tag: {
		borderRadius: 999,
		backgroundColor: '#B5E1F1',
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	tagText: {
		fontSize: 14,
		color: '#001A72',
		fontWeight: '500',
	},
	title: {
		marginTop: 6,
	},
	description: {
		fontSize: 14,
	},
	border: {
		borderWidth: 1,
		borderColor: '#E1F3FA',
		marginTop: 8,
	},
	imagesScroll: {
		height: IMAGE_HEIGHT + 20,
	},
	imagesContent: {
		height: IMAGE_HEIGHT + 20,
		alignItems: 'center',
		paddingHorizontal: 5,
	},
	image: {
		height: IMAGE_HEIGHT,
		paddingHorizontal: 5,
	},
	placeholderText: {
		fontFamily: Fonts.sans,
		fontSize: 12,
		color: Colors.light.text,
	},
	tagsRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	heartIcon: {
		width: 22,
		height: 22,
	},
	compactHeartButton: {
		marginLeft: 10,
	},
	cardCompact: {
		paddingVertical: 10,
	},
	compactContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	compactInfo: {
		flex: 1,
		gap: 4,
	},
	tagsContainerCompact: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
	},
	tagCompact: {
		borderRadius: 999,
		backgroundColor: '#B5E1F1',
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	tagTextCompact: {
		fontSize: 12,
		color: '#001A72',
		fontWeight: '500',
	},
	titleCompact: {
		marginTop: 2,
	},
	compactPlayIcon: {
		fontSize: 18,
		color: '#001A72',
		marginLeft: 10,
	},
	playIndicator: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 3,
		backgroundColor: '#001A72',
		shadowColor: '#5BB9E0',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 4,
		elevation: 5,
		pointerEvents: 'none',
	},
});

export default Preset;
