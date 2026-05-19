package com.foodbox.auth.service;

import com.foodbox.auth.dto.*;
import com.foodbox.auth.user.Address;
import com.foodbox.auth.user.AddressRepository;
import com.foodbox.auth.user.User;
import com.foodbox.auth.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse me() {
        User user = currentUser();
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());

        List<AddressResponse> addresses = addressRepository.findByUserId(user.getId()).stream()
                .sorted(Comparator.comparing(Address::isDefault).reversed().thenComparing(Address::getId))
                .map(this::mapAddress)
                .collect(Collectors.toList());
        response.setAddresses(addresses);
        return response;
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUser();
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);
        return me();
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> listAddresses() {
        User user = currentUser();
        return addressRepository.findByUserId(user.getId()).stream()
                .sorted(Comparator.comparing(Address::isDefault).reversed().thenComparing(Address::getId))
                .map(this::mapAddress)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(AddressRequest request) {
        User user = currentUser();
        Address address = new Address();
        copyAddress(request, address);
        address.setUser(user);

        if (request.isDefault()) {
            clearDefault(user.getId());
            address.setDefault(true);
        }

        Address saved = addressRepository.save(address);
        return mapAddress(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long id, AddressRequest request) {
        User user = currentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));

        boolean makingDefault = request.isDefault();
        copyAddress(request, address);
        if (makingDefault) {
            clearDefault(user.getId());
            address.setDefault(true);
        }
        Address saved = addressRepository.save(address);
        return mapAddress(saved);
    }

    @Transactional
    public void deleteAddress(Long id) {
        User user = currentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        addressRepository.delete(address);
    }

    private void clearDefault(Long userId) {
        addressRepository.findByUserId(userId).forEach(addr -> {
            if (addr.isDefault()) {
                addr.setDefault(false);
            }
        });
    }

    private AddressResponse mapAddress(Address address) {
        AddressResponse response = new AddressResponse();
        response.setId(address.getId());
        response.setLine1(address.getLine1());
        response.setLine2(address.getLine2());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setPostalCode(address.getPostalCode());
        response.setCountry(address.getCountry());
        response.setLabel(address.getLabel());
        response.setDefault(address.isDefault());
        response.setLatitude(address.getLatitude());
        response.setLongitude(address.getLongitude());
        return response;
    }

    private void copyAddress(AddressRequest request, Address address) {
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setLabel(request.getLabel());
        address.setDefault(request.isDefault());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("Unauthenticated");
        }
        return user;
    }
}
