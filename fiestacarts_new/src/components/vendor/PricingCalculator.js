import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';
import { Icon } from '@rneui/themed';

const PricingCalculator = ({ services = [], onServiceSelect }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    // Calculate and notify parent of initial state
    const total = calculateTotal(selectedServices);
    onServiceSelect(selectedServices, total);
  }, []); // Run only once on mount

  const toggleService = (serviceId) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(newSelection);
    
    // Calculate and notify parent of changes
    const total = calculateTotal(newSelection);
    onServiceSelect(newSelection, total);
  };

  const calculateTotal = (selection) => {
    if (!Array.isArray(services)) return 0;
    
    return services
      .filter(service => selection.includes(service.id))
      .reduce((sum, service) => {
        const price = parseFloat(service.price) || 0;
        return sum + price;
      }, 0);
  };

  if (!Array.isArray(services) || services.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="restaurant-menu" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>No services available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {services.map(service => (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.serviceItem,
            selectedServices.includes(service.id) && styles.selectedService
          ]}
          onPress={() => toggleService(service.id)}
        >
          <View style={styles.serviceInfo}>
            <Text style={[
              styles.serviceName,
              selectedServices.includes(service.id) && styles.selectedServiceText
            ]}>
              {service.name}
            </Text>
            <Text style={[
              styles.serviceDescription,
              selectedServices.includes(service.id) && styles.selectedServiceText
            ]}>
              {service.description}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.servicePrice,
              selectedServices.includes(service.id) && styles.selectedServiceText
            ]}>
              ${parseFloat(service.price).toLocaleString()}
            </Text>
            <Icon
              name={selectedServices.includes(service.id) ? 'check-circle' : 'add-circle-outline'}
              size={24}
              color={selectedServices.includes(service.id) ? colors.white : colors.primary}
            />
          </View>
        </TouchableOpacity>
      ))}
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>
          ${calculateTotal(selectedServices).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedService: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceName: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.body,
    color: colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  selectedServiceText: {
    color: colors.white,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default PricingCalculator; 