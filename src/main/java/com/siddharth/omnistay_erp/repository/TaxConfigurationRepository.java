package com.siddharth.omnistay_erp.repository;

import com.siddharth.omnistay_erp.model.DepartmentCode;
import com.siddharth.omnistay_erp.model.TaxConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxConfigurationRepository extends JpaRepository<TaxConfiguration, UUID> {
    List<TaxConfiguration> findByPropertyPropertyIdAndDepartmentCodeAndIsActiveTrue(UUID propertyId, DepartmentCode departmentCode);
    List<TaxConfiguration> findByPropertyPropertyIdAndIsActiveTrue(UUID propertyId);
}
