// components/transactionCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';;
import { useRouter } from 'expo-router';

/* =====================
    TYPES
===================== */
export type TransactionStatus =
    | 'Booked'
    | 'Diproses'
    | 'Dipinjam'
    | 'Ditolak'
    | 'Dikembalikan'
    | 'Selesai';

export type TransactionItem = {
    equipmentName: string;
    quantity: number;
    condition: string;
};

export type Transaction = {
    id: number;
    status: TransactionStatus;
    qrCode: string;
    borrowedAt?: string | null;
    returnedAt?: string | null;
    userName: string;
    items: TransactionItem[];
    // Field tambahan dari API
    mhsId?: number;
    originalStatus?: string;
    isQrVerified?: boolean;
    isFaceVerified?: boolean;
};

interface TransactionCardProps {
    transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
    const router = useRouter();

    /* =====================
        STATUS STYLES (STRICT)
    ===================== */
    const statusStyles: Record<
        TransactionStatus,
        { color: string; backgroundColor: string; label: string }
    > = {
        Booked: { color: '#FF9800', backgroundColor: '#FFF4E5', label: 'Booked' },
        Diproses: { color: '#FFA000', backgroundColor: '#FFF8E1', label: 'Diproses' },
        Dipinjam: { color: '#2979FF', backgroundColor: '#E3F2FD', label: 'Dipinjam' },
        Ditolak: { color: '#F44336', backgroundColor: '#FFEBEE', label: 'Ditolak' },
        Dikembalikan: { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Dikembalikan' },
        Selesai: { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Selesai' }
    };

    // Fallback jika status tidak valid
    const currentStatus = transaction.status || 'Booked';
    const currentStatusStyle = statusStyles[currentStatus] || statusStyles.Booked;

    /* =====================
        DATE FORMAT
    ===================== */
    const displayDate = transaction.borrowedAt;
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';

        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    /* =====================
        ITEMS PREVIEW (DENGAN HANDLING YANG LEBIH BAIK)
    ===================== */
    const renderItems = () => {
        const items = transaction.items || [];

        // Jika items kosong (seperti dari list API)
        if (items.length === 0) {
            return 'Ketuk untuk melihat detail barang';
        }

        // Filter hanya item yang punya equipmentName
        const validItems = items.filter(item => item.equipmentName);

        if (validItems.length === 0) {
            return 'Ketuk untuk melihat detail barang';
        }

        // Ambil maksimal 2 item untuk preview
        const preview = validItems
            .slice(0, 2)
            .map(item => {
                const name = item.equipmentName || 'Barang';
                const qty = item.quantity || 1;
                return `${name} (${qty})`;
            })
            .join(', ');

        return validItems.length > 2
            ? `${preview}, +${validItems.length - 2} lagi`
            : preview;
    };

    /* =====================
        USER INFO
    ===================== */
    const getUserInfo = () => {
        if (transaction.userName && transaction.userName !== `User ${transaction.mhsId}`) {
            return transaction.userName;
        }
        return `User ${transaction.mhsId || 'N/A'}`;
    };

    /* =====================
        QR CODE SHORTEN
    ===================== */
    const shortenQRCode = (qrCode: string) => {
        if (!qrCode) return '-';
        if (qrCode.length <= 12) return qrCode;
        return `${qrCode.substring(0, 8)}...`;
    };

    /* =====================
        NAVIGATION
    ===================== */
    const handlePressCard = () => {
        // Hanya kirim ID saja, detail akan di-fetch di transaction-detail
        router.push({
            pathname: '/transaction-detail',
            params: {
                id: transaction.id.toString()
            }
        });
    };

    /* =====================
        RENDER
    ===================== */
    return (
        <TouchableOpacity style={styles.card} onPress={handlePressCard} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="exchange" size={18} color="#5B4DBC" />
                </View>

                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.txnCode}>
                            TXN-{String(transaction.id).padStart(4, '0')}
                        </Text>
                        <Text style={styles.userName} numberOfLines={1}>
                            {getUserInfo()}
                        </Text>
                    </View>
                    <Text style={styles.itemsText} numberOfLines={1}>
                        {renderItems()}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: currentStatusStyle.backgroundColor }
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            { color: currentStatusStyle.color }
                        ]}
                    >
                        {currentStatusStyle.label}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <FontAwesome
                        name="calendar"
                        size={12}
                        color="#888"
                        style={{ marginRight: 5 }}
                    />
                    <Text style={styles.timestamp}>
                        {formatDate(displayDate)}
                    </Text>
                </View>
                <Text style={styles.qrText}>{shortenQRCode(transaction.qrCode)}</Text>
            </View>

            {/* Verification Indicators */}
            {(transaction.isQrVerified || transaction.isFaceVerified) && (
                <View style={styles.verificationContainer}>
                    {transaction.isQrVerified && (
                        <View style={styles.verificationBadge}>
                            <FontAwesome name="qrcode" size={10} color="#4CAF50" />
                            <Text style={styles.verificationText}>QR Verified</Text>
                        </View>
                    )}
                    {transaction.isFaceVerified && (
                        <View style={styles.verificationBadge}>
                            <FontAwesome5 name="user-check" size={10} color="#2196F3" /> {/* ← PAKAI FontAwesome5 */}
                            <Text style={styles.verificationText}>Face Verified</Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

/* =====================
    STYLES
===================== */
const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        position: 'relative'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    iconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#F3F0FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
        marginRight: 8
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    txnCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        flex: 1
    },
    userName: {
        fontSize: 11,
        color: '#777',
        fontStyle: 'italic',
        marginLeft: 8
    },
    itemsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 2
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F7F7F7',
        paddingTop: 10
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    timestamp: {
        fontSize: 12,
        color: '#999'
    },
    qrText: {
        fontSize: 11,
        color: '#aaa',
        fontFamily: 'monospace'
    },
    verificationContainer: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap'
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
        marginTop: 4
    },
    verificationText: {
        fontSize: 9,
        color: '#666',
        marginLeft: 4
    }
});

export default TransactionCard;