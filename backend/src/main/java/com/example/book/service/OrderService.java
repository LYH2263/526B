package com.example.book.service;

import com.example.book.entity.Book;
import com.example.book.entity.OrderInfo;
import com.example.book.entity.OrderItem;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.CartMapper;
import com.example.book.mapper.OrderInfoMapper;
import com.example.book.mapper.OrderItemMapper;
import com.example.book.vo.CartVO;
import com.example.book.vo.OrderInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderService {

    @Autowired
    private OrderInfoMapper orderInfoMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private BookMapper bookMapper;

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> placeOrder(Long userId) {
        List<CartVO> cartItems = cartMapper.findByUserId(userId);
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("购物车为空，无法下单");
        }

        String orderNo = generateOrderNo();
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, BigDecimal> priceSnapshotMap = new ConcurrentHashMap<>();

        for (CartVO cartItem : cartItems) {
            Book book = bookMapper.findById(cartItem.getBookId());
            if (book == null) {
                throw new RuntimeException("图书不存在: " + cartItem.getBookTitle());
            }
            BigDecimal currentPrice = book.getPrice();
            priceSnapshotMap.put(cartItem.getBookId(), currentPrice);

            BigDecimal subtotal = currentPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
        }

        OrderInfo orderInfo = new OrderInfo();
        orderInfo.setOrderNo(orderNo);
        orderInfo.setUserId(userId);
        orderInfo.setTotalAmount(totalAmount);
        orderInfo.setStatus(1);
        orderInfoMapper.insert(orderInfo);

        for (CartVO cartItem : cartItems) {
            BigDecimal snapshotPrice = priceSnapshotMap.get(cartItem.getBookId());
            Book book = bookMapper.findById(cartItem.getBookId());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(orderInfo.getId());
            orderItem.setBookId(cartItem.getBookId());
            orderItem.setBookTitle(book != null ? book.getTitle() : cartItem.getBookTitle());
            orderItem.setBookAuthor(book != null ? book.getAuthor() : cartItem.getBookAuthor());
            orderItem.setPrice(snapshotPrice);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSubtotal(snapshotPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItemMapper.insert(orderItem);
        }

        BigDecimal verifyTotal = BigDecimal.ZERO;
        for (CartVO cartItem : cartItems) {
            BigDecimal snapshotPrice = priceSnapshotMap.get(cartItem.getBookId());
            verifyTotal = verifyTotal.add(snapshotPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        if (verifyTotal.compareTo(totalAmount) != 0) {
            throw new RuntimeException("金额计算不一致，订单已回滚");
        }

        cartMapper.clearByUserId(userId);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("orderId", orderInfo.getId());
        result.put("orderNo", orderNo);
        result.put("totalAmount", totalAmount);
        return result;
    }

    public List<OrderInfoVO> findMyOrders(Long userId) {
        List<OrderInfoVO> orders = orderInfoMapper.findByUserId(userId);
        for (OrderInfoVO order : orders) {
            List<OrderItem> items = orderItemMapper.findByOrderId(order.getId());
            order.setItems(items);
        }
        return orders;
    }

    public OrderInfoVO getOrderDetail(Long orderId, Long userId) {
        OrderInfoVO order = orderInfoMapper.findById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            return null;
        }
        List<OrderItem> items = orderItemMapper.findByOrderId(orderId);
        order.setItems(items);
        return order;
    }

    private String generateOrderNo() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        Random random = new Random();
        int suffix = random.nextInt(10000);
        return timestamp + String.format("%04d", suffix);
    }
}
