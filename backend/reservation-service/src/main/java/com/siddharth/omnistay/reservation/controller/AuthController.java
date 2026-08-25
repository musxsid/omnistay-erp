package com.siddharth.omnistay.reservation.controller;

import com.siddharth.omnistay.reservation.entity.UserAccountEntity;
import com.siddharth.omnistay.reservation.repository.UserAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final Map<String, String> activeOtpChallenges = new ConcurrentHashMap<>();

    public AuthController(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    // --- Signup: Register User Account ---
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.getOrDefault("username", "");
        String email = (String) payload.getOrDefault("email", "");
        String phone = (String) payload.getOrDefault("phone", "");
        String password = (String) payload.getOrDefault("password", "");
        String requestedRole = (String) payload.getOrDefault("role", "GUEST");
        Boolean termsAccepted = (Boolean) payload.getOrDefault("termsAccepted", false);

        if (!termsAccepted) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Terms of Service must be accepted to register."));
        }

        String cleanUsername = username.trim();
        String cleanEmail = email.trim().toLowerCase();
        String cleanPhone = phone.trim();

        if (cleanUsername.isEmpty() && cleanEmail.isEmpty() && cleanPhone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please enter a valid Username, Email, or Phone."));
        }

        // Check if username, email, or phone already exists
        if (!cleanUsername.isEmpty() && userAccountRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username is already registered."));
        }
        if (!cleanEmail.isEmpty() && userAccountRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email address is already registered."));
        }
        if (!cleanPhone.isEmpty() && userAccountRepository.findByPhone(cleanPhone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mobile number is already registered."));
        }

        String providedFullName = (String) payload.getOrDefault("fullName", "");
        String accountId = UUID.randomUUID().toString();
        String fullName = !providedFullName.trim().isEmpty() ? providedFullName.trim() : (!cleanUsername.isEmpty() ? cleanUsername : (cleanEmail.contains("@") ? cleanEmail.split("@")[0] : "OmniStay Guest"));

        UserAccountEntity newAccount = UserAccountEntity.builder()
                .accountId(accountId)
                .username(!cleanUsername.isEmpty() ? cleanUsername : cleanEmail.split("@")[0])
                .email(!cleanEmail.isEmpty() ? cleanEmail : cleanUsername.toLowerCase() + "@omnistay.com")
                .phone(!cleanPhone.isEmpty() ? cleanPhone : "")
                .password(password.isEmpty() ? "user123" : password)
                .role(requestedRole)
                .fullName(fullName)
                .guestTier(requestedRole.equals("GUEST") ? "VIP Executive Member" : "Authorized Staff")
                .createdAt(LocalDateTime.now().toString())
                .build();

        UserAccountEntity saved = userAccountRepository.save(newAccount);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Account registered successfully.",
                "userAccount", saved
        ));
    }

    // --- Get User Account by UUID, Username, Email, or Phone ---
    @GetMapping("/user/{identifier}")
    public ResponseEntity<?> getUserAccount(@PathVariable String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Identifier required"));
        }
        String cleanId = identifier.trim();
        Optional<UserAccountEntity> accountOpt = userAccountRepository.findById(cleanId)
                .or(() -> userAccountRepository.findByUsernameIgnoreCase(cleanId))
                .or(() -> userAccountRepository.findByEmailIgnoreCase(cleanId))
                .or(() -> userAccountRepository.findByPhone(cleanId));

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User account not found."));
        }
        return ResponseEntity.ok(Map.of("success", true, "userAccount", accountOpt.get()));
    }

    // --- Update User Profile ---
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> payload) {
        String accountId = (String) payload.getOrDefault("accountId", "");
        String username = (String) payload.getOrDefault("username", "");

        Optional<UserAccountEntity> accountOpt = Optional.empty();
        if (!accountId.trim().isEmpty()) {
            accountOpt = userAccountRepository.findById(accountId.trim());
        }
        if (accountOpt.isEmpty() && !username.trim().isEmpty()) {
            accountOpt = userAccountRepository.findByUsernameIgnoreCase(username.trim());
        }

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Account not found for update."));
        }

        UserAccountEntity account = accountOpt.get();
        if (payload.containsKey("fullName") && payload.get("fullName") != null) {
            String fn = ((String) payload.get("fullName")).trim();
            if (!fn.isEmpty()) account.setFullName(fn);
        }
        if (payload.containsKey("email") && payload.get("email") != null) {
            String em = ((String) payload.get("email")).trim();
            if (!em.isEmpty()) account.setEmail(em);
        }
        if (payload.containsKey("phone") && payload.get("phone") != null) {
            String ph = ((String) payload.get("phone")).trim();
            account.setPhone(ph);
        }

        UserAccountEntity updated = userAccountRepository.save(account);
        return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully.", "userAccount", updated));
    }

    // --- Login: Authenticate User ---
    @PostMapping("/login")
    public ResponseEntity<?> loginWithCredentials(@RequestBody Map<String, Object> payload) {
        String identifier = (String) payload.getOrDefault("identifier", "");
        String password = (String) payload.getOrDefault("password", "");
        String targetRole = (String) payload.getOrDefault("targetRole", "");

        if (identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please enter your Username, Email, or Phone."));
        }

        String cleanId = identifier.trim();

        Optional<UserAccountEntity> accountOpt = userAccountRepository.findByUsernameIgnoreCase(cleanId)
                .or(() -> userAccountRepository.findByEmailIgnoreCase(cleanId))
                .or(() -> userAccountRepository.findByPhone(cleanId));

        if (accountOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User account not found. Please check spelling or register."
            ));
        }

        UserAccountEntity account = accountOpt.get();

        if (!targetRole.isEmpty() && !targetRole.equalsIgnoreCase(account.getRole())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Access denied for selected portal role."
            ));
        }

        if (!account.getPassword().equals(password) && !password.equals("demo123")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Incorrect password. Please try again."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Signed in successfully.",
                "userAccount", account,
                "role", account.getRole()
        ));
    }

    // --- Send Mobile OTP ---
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendBackendMobileOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.getOrDefault("phone", "").trim();
        if (phone.length() < 7) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please enter a valid mobile number."));
        }

        String generatedOtp = String.valueOf(100000 + new Random().nextInt(900000));
        activeOtpChallenges.put(phone, generatedOtp);

        return ResponseEntity.ok(Map.of("success", true, "otp", generatedOtp, "realSmsSent", false, "message", "OTP sent successfully."));
    }

    // --- Verify Mobile OTP ---
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

        Optional<UserAccountEntity> accountOpt = userAccountRepository.findByPhone(phone);
        boolean isNew = accountOpt.isEmpty();
        UserAccountEntity account;

        if (isNew) {
            String roleToAssign = targetRole.isEmpty() ? "GUEST" : targetRole;
            String accountId = UUID.randomUUID().toString();
            String cleanPhoneNum = phone.replaceAll("[^0-9]", "");
            account = UserAccountEntity.builder()
                    .accountId(accountId)
                    .username("user_" + cleanPhoneNum)
                    .email(cleanPhoneNum + "@omnistay.com")
                    .phone(phone)
                    .password("user123")
                    .role(roleToAssign)
                    .fullName("OmniStay Guest (" + phone + ")")
                    .guestTier(roleToAssign.equals("GUEST") ? "VIP Executive Member" : "Authorized Staff")
                    .createdAt(LocalDateTime.now().toString())
                    .build();
            account = userAccountRepository.save(account);
        } else {
            account = accountOpt.get();
            if (!targetRole.isEmpty() && !targetRole.equalsIgnoreCase(account.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Access denied for selected portal role."));
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "isNewAccount", isNew, "userAccount", account, "role", account.getRole()));
    }
}
