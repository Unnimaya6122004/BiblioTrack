package com.example.demo.service;

import com.example.demo.dto.AdminAnalyticsResponseDTO;
import com.example.demo.dto.DefaulterAnalyticsDTO;
import com.example.demo.dto.FineTrendPointDTO;
import com.example.demo.dto.TopBookAnalyticsDTO;
import com.example.demo.entity.Fine;
import com.example.demo.entity.enums.FineStatus;
import com.example.demo.entity.enums.LoanStatus;
import com.example.demo.repository.FineRepository;
import com.example.demo.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int TOP_BOOK_LIMIT = 5;
    private static final int DEFAULTER_LIMIT = 5;
    private static final int TREND_MONTHS = 6;

    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;

    public AdminAnalyticsResponseDTO getAdminAnalytics() {
        List<TopBookAnalyticsDTO> topBooks = getTopBooks();
        List<DefaulterAnalyticsDTO> defaulters = getDefaulters();
        List<FineTrendPointDTO> fineTrends = getFineTrends();

        return AdminAnalyticsResponseDTO.builder()
                .topBooks(topBooks)
                .defaulters(defaulters)
                .fineTrends(fineTrends)
                .build();
    }

    private List<TopBookAnalyticsDTO> getTopBooks() {
        List<Object[]> rows = loanRepository.findTopBorrowedBooks(PageRequest.of(0, TOP_BOOK_LIMIT));

        return rows.stream()
                .map(row -> TopBookAnalyticsDTO.builder()
                        .bookId((Integer) row[0])
                        .bookTitle((String) row[1])
                        .loanCount((Long) row[2])
                        .build())
                .toList();
    }

    private List<DefaulterAnalyticsDTO> getDefaulters() {
        Map<Integer, DefaulterAnalyticsDTO.DefaulterAnalyticsDTOBuilder> builderByUserId = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        List<Object[]> overdueRows = loanRepository
                .findOverdueLoanCountsByUser(LoanStatus.ISSUED, today);
        for (Object[] row : overdueRows) {
            Integer userId = (Integer) row[0];
            String userName = (String) row[1];
            Long overdueCount = (Long) row[2];

            builderByUserId.put(
                    userId,
                    DefaulterAnalyticsDTO.builder()
                            .userId(userId)
                            .userName(userName)
                            .overdueLoanCount(overdueCount != null ? overdueCount : 0L)
                            .unpaidFineTotal(BigDecimal.ZERO)
            );
        }

        List<Object[]> fineRows = fineRepository.findFineTotalsByUserAndStatus(FineStatus.UNPAID);
        for (Object[] row : fineRows) {
            Integer userId = (Integer) row[0];
            String userName = (String) row[1];
            BigDecimal unpaidTotal = (BigDecimal) row[2];

            DefaulterAnalyticsDTO.DefaulterAnalyticsDTOBuilder builder = builderByUserId.computeIfAbsent(
                    userId,
                    ignored -> DefaulterAnalyticsDTO.builder()
                            .userId(userId)
                            .userName(userName)
                            .overdueLoanCount(0L)
                            .unpaidFineTotal(BigDecimal.ZERO)
            );
            builder.unpaidFineTotal(unpaidTotal != null ? unpaidTotal : BigDecimal.ZERO);
        }

        return builderByUserId.values().stream()
                .map(DefaulterAnalyticsDTO.DefaulterAnalyticsDTOBuilder::build)
                .sorted(Comparator
                        .comparing(DefaulterAnalyticsDTO::getOverdueLoanCount).reversed()
                        .thenComparing(DefaulterAnalyticsDTO::getUnpaidFineTotal, Comparator.reverseOrder()))
                .limit(DEFAULTER_LIMIT)
                .toList();
    }

    private List<FineTrendPointDTO> getFineTrends() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(TREND_MONTHS - 1L);
        LocalDate startDate = startMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        Map<YearMonth, BigDecimal> raisedByMonth = initMonthMap(startMonth, currentMonth);
        Map<YearMonth, BigDecimal> paidByMonth = initMonthMap(startMonth, currentMonth);

        List<Fine> issuedFines = fineRepository.findByIssuedDateBetween(startDate, endDate);
        for (Fine fine : issuedFines) {
            if (fine.getIssuedDate() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(fine.getIssuedDate());
            raisedByMonth.computeIfPresent(month, (key, value) -> value.add(fine.getAmount()));
        }

        List<Fine> paidFines = fineRepository.findByPaidDateBetween(startDate, endDate);
        for (Fine fine : paidFines) {
            if (fine.getPaidDate() == null || !FineStatus.PAID.equals(fine.getStatus())) {
                continue;
            }
            YearMonth month = YearMonth.from(fine.getPaidDate());
            paidByMonth.computeIfPresent(month, (key, value) -> value.add(fine.getAmount()));
        }

        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ROOT);
        List<FineTrendPointDTO> trendPoints = new ArrayList<>();

        for (YearMonth month : raisedByMonth.keySet()) {
            trendPoints.add(FineTrendPointDTO.builder()
                    .month(month.format(labelFormatter))
                    .raisedAmount(raisedByMonth.get(month))
                    .paidAmount(paidByMonth.get(month))
                    .build());
        }

        return trendPoints;
    }

    private Map<YearMonth, BigDecimal> initMonthMap(YearMonth startMonth, YearMonth endMonth) {
        Map<YearMonth, BigDecimal> result = new LinkedHashMap<>();

        YearMonth current = startMonth;
        while (!current.isAfter(endMonth)) {
            result.put(current, BigDecimal.ZERO);
            current = current.plusMonths(1);
        }

        return result;
    }
}
