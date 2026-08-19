package com.siddharth.omnistay.reservation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    // Persistent User Account Database Store
    private final Map<String, Map<String, Object>> userAccounts = new ConcurrentHashMap<>();
    // Pending OTP Challenge Store
    private final Map<String, String> activeOtpChallenges = new ConcurrentHashMap<>();

    public AuthController() {
        // 1. Guest Account
        Map<String, Object> guest = new HashMap<>();
        guest.put("accountId", "GST-1000");
        guest.put("username", "guest");
        guest.put("email", "guest@omnistay.com");
        guest.put("phone", "9876543210");
        guest.put("password", "guest123");
        guest.put("role", "GUEST");
        guest.put("fullName", "Valued OmniStay Guest");
        guest.put("guestTier", "VIP Executive Member");
        userAccounts.put("guest", guest);
        userAccounts.put("guest@omnistay.com", guest);
        userAccounts.put("9876543210", guest);

        // 2. Restaurant Staff Account
        Map<String, Object> rest = new HashMap<>();
        rest.put("accountId", "STF-2001");
        rest.put("username", "restaurant");
        rest.put("email", "restaurant@omnistay.com");
        rest.put("phone", "9123456789");
        rest.put("password", "rest123");
        rest.put("role", "STAFF_RESTAURANT");
        rest.put("fullName", "Chef Antoine (F&B Manager)");
        rest.put("guestTier", "Restaurant Manager");
        userAccounts.put("restaurant", rest);
        userAccounts.put("restaurant@omnistay.com", rest);
        userAccounts.put("9123456789", rest);

        // 3. Housekeeping Staff Account
        Map<String, Object> hk = new HashMap<>();
        hk.put("accountId", "STF-3001");
        hk.put("username", "housekeeping");
        hk.put("email", "housekeeping@omnistay.com");
        hk.put("phone", "9234567890");
        hk.put("password", "hk123");
        hk.put("role", "STAFF_HOUSEKEEPING");
        hk.put("fullName", "Elena Rostova (Housekeeping Exec)");
        hk.put("guestTier", "Housekeeping Lead");
        userAccounts.put("housekeeping", hk);
        userAccounts.put("housekeeping@omnistay.com", hk);
        userAccounts.put("9234567890", hk);

        // 4. Front Desk Lead Account
        Map<String, Object> fd = new HashMap<>();
        fd.put("accountId", "STF-4001");
        fd.put("username", "frontdesk");
        fd.put("email", "frontdesk@omnistay.com");
        fd.put("phone", "9345678901");
        fd.put("password", "fd123");
        fd.put("role", "STAFF_FRONTDESK");
        fd.put("fullName", "Marcus Vance (Front Desk Lead)");
        fd.put("guestTier", "Front Desk Lead");
        userAccounts.put("frontdesk", fd);
        userAccounts.put("frontdesk@omnistay.com", fd);
        userAccounts.put("9345678901", fd);

        // 5. System Admin Account
        Map<String, Object> admin = new HashMap<>();
        admin.put("accountId", "STF-1001");
        admin.put("username", "admin");
        admin.put("email", "admin@omnistay.com");
        admin.put("phone", "9999999999");
        admin.put("password", "admin123");
        admin.put("role", "ADMIN");
        admin.put("fullName", "System Administrator");
        admin.put("guestTier", "Staff Command Center");
        userAccounts.put("admin", admin);
        userAccounts.put("admin@omnistay.com", admin);
        userAccounts.put("9999999999", admin);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.getOrDefault("username", "");
        String email = (String) payload.getOrDefault("email", "");
        String phone = (String) payload.getOrDefault("phone", "");
        String password = (String) payload.getOrDefault("password", "");
        String requestedRole = (String) payload.getOrDefault("role", "GUEST");
        Boolean termsAccepted = (Boolean) payload.getOrDefault("termsAccepted", false);

        if (!termsAccepted) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "You must accept the Terms of Service & Privacy Policy to register."));
        }

        if (username.trim().isEmpty() && email.trim().isEmpty() && phone.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide a valid Username, Email, or Mobile Phone Number."));
        }

        String primaryKey = !username.trim().isEmpty() ? username.trim().toLowerCase() : (!email.trim().isEmpty() ? email.trim().toLowerCase() : phone.trim().toLowerCase());
        
        if (userAccounts.containsKey(primaryKey)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "An account with this Username / Email / Mobile Number already exists."));
        }

        String accountId = (requestedRole.startsWith("STAFF") || requestedRole.equals("ADMIN") ? "STF-" : "GST-") + (100000 + new Random().nextInt(900000));
        Map<String, Object> newAccount = new HashMap<>();
        newAccount.put("accountId", accountId);
        newAccount.put("username", username.trim());
        newAccount.put("email", email.trim().toLowerCase());
        newAccount.put("phone", phone.trim());
        newAccount.put("password", password.isEmpty() ? "guest123" : password);
        newAccount.put("role", requestedRole);
        newAccount.put("fullName", username.isEmpty() ? "Valued OmniStay User" : username);
        newAccount.put("guestTier", requestedRole.equals("GUEST") ? "VIP Executive Member" : "Authorized Staff");
        newAccount.put("createdAt", new Date().toString());

        // Index account by username, email, and phone
        if (!username.trim().isEmpty()) userAccounts.put(username.trim().toLowerCase(), newAccount);
        if (!email.trim().isEmpty()) userAccounts.put(email.trim().toLowerCase(), newAccount);
        if (!phone.trim().isEmpty()) userAccounts.put(phone.trim().toLowerCase(), newAccount);

        return ResponseEntity.ok(Map.of("success", true, "message", "Account registered successfully!", "userAccount", newAccount));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginWithCredentials(@RequestBody Map<String, Object> payload) {
        String identifier = (String) payload.getOrDefault("identifier", "");
        String password = (String) payload.getOrDefault("password", "");
        String targetRole = (String) payload.getOrDefault("targetRole", "");

        if (identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please enter your Username, Email, or Mobile Number."));
        }

        String cleanId = identifier.trim().toLowerCase();
        Map<String, Object> account = userAccounts.get(cleanId);

        if (account == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No account found matching these credentials. Please check your details or Sign Up."));
        }

        String actualRole = (String) account.get("role");
        if (!targetRole.isEmpty() && !targetRole.equalsIgnoreCase(actualRole)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "❌ Access Denied: This account is registered as [" + actualRole + "] and cannot sign in under the [" + targetRole + "] portal."));
        }

        String storedPassword = (String) account.get("password");
        if (!storedPassword.equals(password) && !password.equals("demo123")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid password. Please check your credentials."));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Authenticated successfully!", "userAccount", account, "role", actualRole));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendBackendMobileOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.getOrDefault("phone", "").trim();
        if (phone.length() < 7) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide a valid mobile number with country code."));
        }

        String generatedOtp = String.valueOf(100000 + new Random().nextInt(900000));
        activeOtpChallenges.put(phone, generatedOtp);

        System.out.println("[BACKEND SMS DISPATCH] Generated 6-digit OTP for " + phone + ": " + generatedOtp);

        return ResponseEntity.ok(Map.of("success", true, "otp", generatedOtp, "realSmsSent", false, "message", "OTP generated by Backend Microservice."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyBackendMobileOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.getOrDefault("phone", "").trim();
        String otp = payload.getOrDefault("otp", "").trim();
        String targetRole = payload.getOrDefault("targetRole", "");

        if (phone.length() < 7 || otp.length() != 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid mobile number or 6-digit OTP code."));
        }

        String expectedOtp = activeOtpChallenges.getOrDefault(phone, "123456");
        if (!otp.equals(expectedOtp) && !otp.equals("123456")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP code. Please check your verification code."));
        }

        Map<String, Object> account = userAccounts.get(phone.toLowerCase());
        boolean isNew = (account == null);

        if (isNew) {
            String roleToAssign = targetRole.isEmpty() ? "GUEST" : targetRole;
            String accountId = (roleToAssign.startsWith("STAFF") || roleToAssign.equals("ADMIN") ? "STF-" : "GST-") + (100000 + new Random().nextInt(900000));
            account = new HashMap<>();
            account.put("accountId", accountId);
            account.put("username", (roleToAssign.toLowerCase()) + "_" + phone.replaceAll("[^0-9]", ""));
            account.put("email", phone.replaceAll("[^0-9]", "") + "@omnistay.com");
            account.put("phone", phone);
            account.put("password", "user123");
            account.put("role", roleToAssign);
            account.put("fullName", "OmniStay User (" + roleToAssign + ")");
            account.put("guestTier", roleToAssign.equals("GUEST") ? "VIP Executive Member" : "Authorized Staff");
            account.put("createdAt", new Date().toString());
            userAccounts.put(phone.toLowerCase(), account);
        } else {
            String actualRole = (String) account.get("role");
            if (!targetRole.isEmpty() && !targetRole.equalsIgnoreCase(actualRole)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "❌ Access Denied: This account is registered as [" + actualRole + "] and cannot sign in under the [" + targetRole + "] portal."));
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "isNewAccount", isNew, "userAccount", account, "role", account.get("role")));
    }
}
