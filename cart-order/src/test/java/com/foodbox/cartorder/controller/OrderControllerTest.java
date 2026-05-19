package com.foodbox.cartorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void place_and_get_order() throws Exception {
        Map<String, Object> addPayload = Map.of(
                "foodId", 10,
                "foodName", "Sample Dish",
                "quantity", 2,
                "unitPrice", 100.0
        );

        // Add to cart
        mockMvc.perform(post("/cart/add")
                        .header("X-USER-ID", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addPayload)))
                .andExpect(status().isCreated());

        Map<String, Object> orderPayload = Map.of("addressId", 5);
        // Place order
        mockMvc.perform(post("/orders")
                        .header("X-USER-ID", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderPayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalPrice").value(200.0));

        // List orders
        mockMvc.perform(get("/orders").header("X-USER-ID", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].items[0].foodName").value("Sample Dish"));
    }
}
