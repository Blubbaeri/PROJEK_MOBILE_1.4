import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from 'moti/skeleton';

export default function TransactionDetailSkeleton() {
    return (
        <View style={styles.container}>

            {/* CARD */}
            <View style={styles.card}>
                <Skeleton height={12} width={100} />

                <View style={{ marginTop: 8 }}>
                    <Skeleton height={22} width={160} />
                </View>

                <View style={styles.divider}>
                    <Skeleton height={1} width="100%" />
                </View>

                <Skeleton height={14} width={80} />

                <View style={{ marginTop: 8 }}>
                    <Skeleton height={18} width={120} />
                </View>

                <View style={{ marginTop: 6 }}>
                    <Skeleton height={12} width={200} />
                </View>
            </View>

            {/* TITLE */}
            <View style={{ marginBottom: 12 }}>
                <Skeleton height={18} width={140} />
            </View>

            {/* ITEM 1 */}
            <View style={styles.item}>
                <Skeleton height={40} width={40} radius={10} />

                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Skeleton height={14} width="80%" />

                    <View style={{ marginTop: 6 }}>
                        <Skeleton height={12} width="60%" />
                    </View>
                </View>
            </View>

            {/* ITEM 2 */}
            <View style={styles.item}>
                <Skeleton height={40} width={40} radius={10} />

                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Skeleton height={14} width="70%" />

                    <View style={{ marginTop: 6 }}>
                        <Skeleton height={12} width="50%" />
                    </View>
                </View>
            </View>

            {/* BUTTON */}
            <View style={{ marginTop: 30 }}>
                <Skeleton height={50} width="100%" radius={12} />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
    },
    divider: {
        marginVertical: 15
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10
    }
});
