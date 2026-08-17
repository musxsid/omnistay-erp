package com.siddharth.omnistay_erp.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("tenantSecurity")
public class PropertyTenantSecurityEvaluator {

    /**
     * Evaluates if the authenticated user has access to perform operations on the specified propertyId.
     * Enforces multi-tenant isolation across properties.
     */
    public boolean hasPropertyAccess(Authentication authentication, UUID propertyId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // SUPER_ADMIN has global access across all properties
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_SUPER_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }

        // Check if property_id claim in Keycloak JWT matches requested propertyId
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String jwtPropertyIdStr = jwt.getClaimAsString("property_id");
            if (jwtPropertyIdStr != null && propertyId != null) {
                try {
                    UUID jwtPropertyId = UUID.fromString(jwtPropertyIdStr);
                    return jwtPropertyId.equals(propertyId);
                } catch (IllegalArgumentException ignored) {
                    return false;
                }
            }
        }

        return false;
    }
}
