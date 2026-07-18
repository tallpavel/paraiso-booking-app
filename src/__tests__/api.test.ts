import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../api';

// Mock the fetch function
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

// Helper to mock successful fetch responses
const mockSuccessfulFetch = (data: any, status: number = 200) => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        status: status,
        json: async () => data,
    });
};

// Helper to mock failed fetch responses
const mockFailedFetch = (error: any, status: number = 400) => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        status: status,
        json: async () => error,
    });
};

describe('API Service', () => {
    // Reset mocks before each test
    beforeEach(() => {
        mockFetch.mockClear();
        // Unmock all modules
        vi.restoreAllMocks();
        // Mocking import.meta.env to use /api as the base URL
        vi.stubGlobal('import.meta.env', {
            VITE_API_URL: '/api', // Changed to /api to match default behavior
            PROD: false,
        });
    });

    // Test createReservation
    describe('createReservation', () => {
        it('should successfully create a reservation', async () => {
            const reservationData = {
                guestName: 'John Doe',
                guestEmail: 'john.doe@example.com',
                guestPhone: '1234567890',
                checkIn: '2024-01-10',
                checkOut: '2024-01-15',
                nights: 5,
                totalPrice: 500,
            };
            const expectedResponse = { _id: '123', ...reservationData, createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.createReservation(reservationData);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData),
            });
        });

        it('should throw an error if reservation creation fails', async () => {
            const reservationData = {
                guestName: 'John Doe',
                guestEmail: 'john.doe@example.com',
                guestPhone: '1234567890',
                checkIn: '2024-01-10',
                checkOut: '2024-01-15',
                nights: 5,
                totalPrice: 500,
            };
            const errorResponse = { message: 'Failed to create reservation' };
            mockFailedFetch(errorResponse, 400);

            await expect(api.createReservation(reservationData)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData),
            });
        });

        it('should handle empty error response and throw a generic error', async () => {
            const reservationData = {
                guestName: 'John Doe',
                guestEmail: 'john.doe@example.com',
                guestPhone: '1234567890',
                checkIn: '2024-01-10',
                checkOut: '2024-01-15',
                nights: 5,
                totalPrice: 500,
            };
            // Simulate a server error with no JSON body
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error('Failed to parse JSON');
                }
            });

            await expect(api.createReservation(reservationData)).rejects.toHaveProperty('message', 'Something went wrong. Please try again.');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchReservations
    describe('fetchReservations', () => {
        it('should fetch all reservations', async () => {
            const expectedReservations = [{ _id: '1', guestName: 'Jane Doe', checkIn: '', checkOut: '', nights: 0, totalPrice: 0, createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedReservations);

            const result = await api.fetchReservations();
            expect(result).toEqual(expectedReservations);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations');
        });

        it('should throw an error if fetching reservations fails', async () => {
            mockFailedFetch({ message: 'Network error' }, 500);

            await expect(api.fetchReservations()).rejects.toThrow('Failed to fetch reservations');
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations');
        });
    });

    // Test fetchConfirmedReservations
    describe('fetchConfirmedReservations', () => {
        it('should fetch confirmed reservations', async () => {
            const expectedReservations = [{ _id: '2', guestName: 'Alice Smith', checkIn: '', checkOut: '', createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedReservations);

            const result = await api.fetchConfirmedReservations();
            expect(result).toEqual(expectedReservations);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed');
        });

        it('should throw an error if fetching confirmed reservations fails', async () => {
            mockFailedFetch({ message: 'Server error' }, 503);

            await expect(api.fetchConfirmedReservations()).rejects.toThrow('Failed to fetch confirmed reservations');
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed');
        });
    });

    // Test fetchSeasonalRates
    describe('fetchSeasonalRates', () => {
        it('should fetch seasonal rates', async () => {
            const expectedRates = { rates: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210], updatedAt: '2024-01-01' };
            mockSuccessfulFetch(expectedRates);

            const result = await api.fetchSeasonalRates();
            expect(result).toEqual(expectedRates);
            // Check that the URL includes a cache-busting parameter
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/seasonal-rates?_t='));
        });

        it('should throw an error if fetching seasonal rates fails', async () => {
            mockFailedFetch({ message: 'Network issue' }, 404);

            await expect(api.fetchSeasonalRates()).rejects.toThrow('Failed to fetch seasonal rates');
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/seasonal-rates?_t='));
        });
    });

    // Test updateSeasonalRates
    describe('updateSeasonalRates', () => {
        const token = 'test-token';
        it('should update seasonal rates', async () => {
            const rates = [110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220];
            const expectedResponse = { rates: rates, updatedAt: '2024-01-02' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.updateSeasonalRates(token, rates);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/seasonal-rates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
                body: JSON.stringify({ rates }),
            });
        });

        it('should throw an error if updating seasonal rates fails', async () => {
            const rates = [110, 120];
            const errorResponse = { message: 'Unauthorized' };
            mockFailedFetch(errorResponse, 401);

            await expect(api.updateSeasonalRates(token, rates)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/seasonal-rates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
                body: JSON.stringify({ rates }),
            });
        });
    });

    // Test fetchDailyRates
    describe('fetchDailyRates', () => {
        it('should fetch daily rates for the next 12 months', async () => {
            const mockDate = new Date('2024-01-15T10:00:00Z');
            vi.useFakeTimers().setSystemTime(mockDate);

            const expectedDailyRates = [
                { _id: 'd1', date: '2024-01-20', price: 150, note: 'Special event', createdAt: '', updatedAt: '' },
                { _id: 'd2', date: '2024-02-10', price: 160, note: '', createdAt: '', updatedAt: '' },
            ];
            // Mocking multiple calls to fetch for each month
            mockSuccessfulFetch(expectedDailyRates[0]); // Mock for Jan 2024
            mockSuccessfulFetch(expectedDailyRates[1]); // Mock for Feb 2024
            for (let i = 2; i < 36; i++) mockSuccessfulFetch([]);

            const result = await api.fetchDailyRates();
            expect(result).toEqual(expectedDailyRates);

            // Check that fetch was called 12 times with correct parameters
            expect(mockFetch).toHaveBeenCalledTimes(36);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/daily-rates?year=2024&month=1&_t='));
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/daily-rates?year=2024&month=2&_t='));
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/daily-rates?year=2024&month=12&_t='));

            vi.useRealTimers(); // Restore real timers
        });

        it('should return empty array if fetching daily rates fails for all months', async () => {
            const mockDate = new Date('2024-01-15T10:00:00Z');
            vi.useFakeTimers().setSystemTime(mockDate);

            // Mocking all 36 calls to return an error or empty
            for (let i = 0; i < 36; i++) {
                mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'Error' }) });
            }

            const result = await api.fetchDailyRates();
            expect(result).toEqual([]);
            expect(mockFetch).toHaveBeenCalledTimes(36);

            vi.useRealTimers();
        });
    });

    // Test createDailyRate
    describe('createDailyRate', () => {
        const token = 'test-token';
        const date = '2024-03-15';
        const price = 200;
        const note = 'Holiday pricing';

        it('should create a daily rate', async () => {
            const expectedResponse = { _id: 'd3', date, price, note, createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.createDailyRate(token, date, price, note);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/daily-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
                body: JSON.stringify({ date, price, note }),
            });
        });

        it('should create a daily rate without a note', async () => {
            const expectedResponse = { _id: 'd4', date, price, note: undefined, createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.createDailyRate(token, date, price);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/daily-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
                body: JSON.stringify({ date, price, note: undefined }),
            });
        });

        it('should throw an error if creating daily rate fails', async () => {
            const errorResponse = { message: 'Invalid date' };
            mockFailedFetch(errorResponse, 400);

            await expect(api.createDailyRate(token, date, price, note)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/daily-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
                body: JSON.stringify({ date, price, note }),
            });
        });
    });

    // Test deleteDailyRate
    describe('deleteDailyRate', () => {
        const token = 'test-token';
        const id = 'd3';

        it('should delete a daily rate', async () => {
            const expectedResponse = { message: 'Price deleted successfully' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteDailyRate(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/daily-rates/d3', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
            });
        });

        it('should throw an error if deleting daily rate fails', async () => {
            mockFailedFetch({ message: 'Not found' }, 404);

            await expect(api.deleteDailyRate(token, id)).rejects.toThrow('Failed to delete price');
            expect(mockFetch).toHaveBeenCalledWith('/api/daily-rates/d3', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
            });
        });
    });

    // Test sendContactMessage
    describe('sendContactMessage', () => {
        it('should send a contact message', async () => {
            const messageData = { name: 'Test User', email: 'test@example.com', message: 'Hello!' };
            const expectedResponse = { message: 'Message sent successfully' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendContactMessage(messageData);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
        });

        it('should throw an error if sending message fails', async () => {
            const messageData = { name: 'Test User', email: 'test@example.com', message: 'Hello!' };
            const errorResponse = { message: 'Failed to send message' };
            mockFailedFetch(errorResponse, 500);

            await expect(api.sendContactMessage(messageData)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
        });
    });

    // Test adminLogin
    describe('adminLogin', () => {
        it('should log in admin successfully', async () => {
            const password = 'admin-password';
            const expectedResponse = { token: 'admin-token', expiresIn: 3600 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.adminLogin(password);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/centralni-mozek-stranky/vchod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
        });

        it('should require 2FA setup', async () => {
            const password = 'admin-password';
            const expectedResponse = { requires2FASetup: true, secret: 'some-secret', qrDataUrl: 'data:image/png;base64,...' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.adminLogin(password);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalled();
        });

        it('should throw an error on login failure', async () => {
            const password = 'wrong-password';
            const errorResponse = { message: 'Invalid credentials' };
            mockFailedFetch(errorResponse, 401);

            await expect(api.adminLogin(password)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test adminVerify2FA
    describe('adminVerify2FA', () => {
        it('should verify 2FA successfully', async () => {
            const password = 'admin-password';
            const token = '123456';
            const expectedResponse = { token: 'admin-token', expiresIn: 3600 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.adminVerify2FA(password, token);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/centralni-mozek-stranky/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, token }),
            });
        });

        it('should throw an error on 2FA verification failure', async () => {
            const password = 'admin-password';
            const token = 'invalid-token';
            const errorResponse = { message: 'Invalid verification code' };
            mockFailedFetch(errorResponse, 400);

            await expect(api.adminVerify2FA(password, token)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test adminSetup2FA
    describe('adminSetup2FA', () => {
        it('should set up 2FA successfully', async () => {
            const password = 'admin-password';
            const token = 'verification-token';
            const secret = 'setup-secret';
            const expectedResponse = { token: 'admin-token', expiresIn: 3600 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.adminSetup2FA(password, token, secret);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/centralni-mozek-stranky/setup-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, token, secret }),
            });
        });

        it('should throw an error on 2FA setup failure', async () => {
            const password = 'admin-password';
            const token = 'verification-token';
            const secret = 'setup-secret';
            const errorResponse = { message: 'Failed to set up 2FA' };
            mockFailedFetch(errorResponse, 500);

            await expect(api.adminSetup2FA(password, token, secret)).rejects.toEqual(errorResponse);
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchAdminStats
    describe('fetchAdminStats', () => {
        const token = 'admin-token';
        it('should fetch admin stats', async () => {
            const expectedStats = { pendingRequests: 5, confirmedTotal: 100, paymentPending: 10, paymentPaid: 80, paymentFailed: 10, upcomingCheckIns: 3 };
            mockSuccessfulFetch(expectedStats);

            const result = await api.fetchAdminStats(token);
            expect(result).toEqual(expectedStats);
            expect(mockFetch).toHaveBeenCalledWith('/api/centralni-mozek-stranky/stats', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if stats fetch fails', async () => {
            mockFailedFetch({ message: 'Internal Server Error' }, 500);

            await expect(api.fetchAdminStats(token)).rejects.toThrow('Failed to fetch stats');
            expect(mockFetch).toHaveBeenCalled();
        });

        it('should throw unauthorized error if status is 401', async () => {
            mockFailedFetch({ message: 'Unauthorized' }, 401);

            await expect(api.fetchAdminStats(token)).rejects.toThrow('401: Unauthorized');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchReservationsAuth
    describe('fetchReservationsAuth', () => {
        const token = 'admin-token';
        it('should fetch reservations with auth', async () => {
            const expectedReservations = [{ _id: '1', guestName: 'Jane Doe', checkIn: '', checkOut: '', nights: 0, totalPrice: 0, createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedReservations);

            const result = await api.fetchReservationsAuth(token);
            expect(result).toEqual(expectedReservations);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if fetching reservations fails', async () => {
            mockFailedFetch({ message: 'Network error' }, 500);

            await expect(api.fetchReservationsAuth(token)).rejects.toThrow('Failed to fetch reservations');
            expect(mockFetch).toHaveBeenCalled();
        });

        it('should throw unauthorized error if status is 401', async () => {
            mockFailedFetch({ message: 'Unauthorized' }, 401);

            await expect(api.fetchReservationsAuth(token)).rejects.toThrow('401: Unauthorized');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchConfirmedReservationsFull
    describe('fetchConfirmedReservationsFull', () => {
        const token = 'admin-token';
        it('should fetch full confirmed reservations', async () => {
            const expectedReservations = [{ _id: '2', guestName: 'Alice Smith', guestEmail: 'a@e.com', checkIn: '', checkOut: '', paymentStatus: 'paid', createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedReservations);

            const result = await api.fetchConfirmedReservationsFull(token);
            expect(result).toEqual(expectedReservations);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if fetching fails', async () => {
            mockFailedFetch({ message: 'Server error' }, 503);

            await expect(api.fetchConfirmedReservationsFull(token)).rejects.toThrow('Failed to fetch confirmed reservations');
            expect(mockFetch).toHaveBeenCalled();
        });

        it('should throw unauthorized error if status is 401', async () => {
            mockFailedFetch({ message: 'Unauthorized' }, 401);

            await expect(api.fetchConfirmedReservationsFull(token)).rejects.toThrow('401: Unauthorized');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchArchivedReservations
    describe('fetchArchivedReservations', () => {
        const token = 'admin-token';
        it('should fetch archived reservations', async () => {
            const expectedReservations = [{ _id: '3', guestName: 'Bob Johnson', guestEmail: 'b@e.com', checkIn: '', checkOut: '', createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedReservations);

            const result = await api.fetchArchivedReservations(token);
            expect(result).toEqual(expectedReservations);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/archived/list', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if fetching fails', async () => {
            mockFailedFetch({ message: 'Network error' }, 500);

            await expect(api.fetchArchivedReservations(token)).rejects.toThrow('Failed to fetch archived reservations');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test toggleCheckIn
    describe('toggleCheckIn', () => {
        const token = 'admin-token';
        const id = 'res-id-1';
        it('should toggle check-in status', async () => {
            const expectedResponse = { _id: id, checkedIn: true, checkedInAt: new Date().toISOString() };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.toggleCheckIn(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-1/checkin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if toggling fails', async () => {
            mockFailedFetch({ message: 'Cannot toggle check-in' }, 400);

            await expect(api.toggleCheckIn(token, id)).rejects.toThrow('Failed to toggle check-in status');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test sendCheckInEmail
    describe('sendCheckInEmail', () => {
        const token = 'admin-token';
        const reservationId = 'res-id-2';
        it('should send check-in email', async () => {
            const expectedResponse = { message: 'Email sent', checkInUrl: 'http://example.com/checkin/xyz' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendCheckInEmail(token, reservationId);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/checkin/send/res-id-2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if sending email fails', async () => {
            mockFailedFetch({ message: 'Email service down' }, 503);

            await expect(api.sendCheckInEmail(token, reservationId)).rejects.toEqual({ message: 'Email service down' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test sendRemainingPaymentEmail
    describe('sendRemainingPaymentEmail', () => {
        const token = 'admin-token';
        const id = 'res-id-3';
        it('should send remaining payment email (stripe)', async () => {
            const expectedResponse = { message: 'Payment email sent', paymentUrl: 'http://stripe.com/pay/abc', remainingBalance: 50 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendRemainingPaymentEmail(token, id, 'stripe');
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-3/send-remaining-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: 'stripe' }),
            });
        });

        it('should send remaining payment email (paypal)', async () => {
            const expectedResponse = { message: 'Payment email sent', paymentUrl: 'http://paypal.com/pay/def', remainingBalance: 50 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendRemainingPaymentEmail(token, id, 'paypal');
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-3/send-remaining-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: 'paypal' }),
            });
        });

        it('should throw an error if sending email fails', async () => {
            mockFailedFetch({ message: 'Payment gateway error' }, 500);

            await expect(api.sendRemainingPaymentEmail(token, id)).rejects.toEqual({ message: 'Payment gateway error' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test sendDepositPaymentEmail
    describe('sendDepositPaymentEmail', () => {
        const token = 'admin-token';
        const id = 'res-id-4';
        it('should send deposit payment email (stripe)', async () => {
            const expectedResponse = { message: 'Deposit email sent', paymentUrl: 'http://stripe.com/deposit/ghi', depositAmount: 25 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendDepositPaymentEmail(token, id, 'stripe');
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-4/send-deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: 'stripe' }),
            });
        });

        it('should throw an error if sending email fails', async () => {
            mockFailedFetch({ message: 'Deposit service error' }, 500);

            await expect(api.sendDepositPaymentEmail(token, id)).rejects.toEqual({ message: 'Deposit service error' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test sendFullPaymentEmail
    describe('sendFullPaymentEmail', () => {
        const token = 'admin-token';
        const id = 'res-id-5';
        it('should send full payment email (paypal)', async () => {
            const expectedResponse = { message: 'Full payment email sent', paymentUrl: 'http://paypal.com/pay/jkl', totalAmount: 100 };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendFullPaymentEmail(token, id, 'paypal');
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-5/send-full-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: 'paypal' }),
            });
        });

        it('should throw an error if sending email fails', async () => {
            mockFailedFetch({ message: 'Full payment service error' }, 500);

            await expect(api.sendFullPaymentEmail(token, id)).rejects.toEqual({ message: 'Full payment service error' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test sendAccessInfoEmail
    describe('sendAccessInfoEmail', () => {
        const token = 'admin-token';
        const id = 'res-id-6';
        it('should send access info email', async () => {
            const expectedResponse = { message: 'Access info sent' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.sendAccessInfoEmail(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/res-id-6/send-access-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if sending email fails', async () => {
            mockFailedFetch({ message: 'Access info service error' }, 500);

            await expect(api.sendAccessInfoEmail(token, id)).rejects.toEqual({ message: 'Access info service error' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchCheckInDetails
    describe('fetchCheckInDetails', () => {
        const token = 'admin-token';
        const reservationId = 'res-id-7';
        it('should fetch check-in details', async () => {
            const expectedDetails = {
                guestName: 'John Doe', guestEmail: 'john@doe.com', checkIn: '', checkOut: '', guests: [], submittedAt: null, checkInUrl: '', updatedAt: '',
            };
            mockSuccessfulFetch(expectedDetails);

            const result = await api.fetchCheckInDetails(token, reservationId);
            expect(result).toEqual(expectedDetails);
            expect(mockFetch).toHaveBeenCalledWith('/api/checkin/reservation/res-id-7', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if fetching details fails', async () => {
            mockFailedFetch({ message: 'No check-in data found' }, 404);

            await expect(api.fetchCheckInDetails(token, reservationId)).rejects.toEqual({ message: 'No check-in data found' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchCheckInData
    describe('fetchCheckInData', () => {
        const checkInToken = 'checkin-token-123';
        it('should fetch check-in form data', async () => {
            const expectedData = {
                guestName: 'Jane Doe', guestEmail: 'jane@doe.com', checkIn: '', checkOut: '', guests: [], submittedAt: null,
            };
            mockSuccessfulFetch(expectedData);

            const result = await api.fetchCheckInData(checkInToken);
            expect(result).toEqual(expectedData);
            expect(mockFetch).toHaveBeenCalledWith('/api/checkin/checkin-token-123');
        });

        it('should throw an error if fetching data fails', async () => {
            mockFailedFetch({ message: 'Invalid check-in token' }, 400);

            await expect(api.fetchCheckInData(checkInToken)).rejects.toEqual({ message: 'Invalid check-in token' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test submitCheckInData
    describe('submitCheckInData', () => {
        const checkInToken = 'checkin-token-456';
        const guests = [{ fullName: 'Test Guest', dateOfBirth: '2000-01-01', nationality: 'Test', documentType: 'passport' as const, documentNumber: '12345' }];
        it('should submit check-in data', async () => {
            const expectedResponse = { message: 'Check-in data submitted', guests: guests, submittedAt: new Date().toISOString() };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.submitCheckInData(checkInToken, guests);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/checkin/checkin-token-456', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guests, turnstileToken: undefined }),
            });
        });

        it('should submit check-in data with turnstile token', async () => {
            const turnstileToken = 'ts-token-789';
            const expectedResponse = { message: 'Check-in data submitted', guests: guests, submittedAt: new Date().toISOString() };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.submitCheckInData(checkInToken, guests, turnstileToken);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/checkin/checkin-token-456', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guests, turnstileToken }),
            });
        });

        it('should throw an error if submission fails', async () => {
            mockFailedFetch({ message: 'Failed to submit check-in data' }, 500);

            await expect(api.submitCheckInData(checkInToken, guests)).rejects.toEqual({ message: 'Failed to submit check-in data' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test confirmReservation
    describe('confirmReservation', () => {
        const token = 'admin-token';
        const id = 'res-id-8';
        it('should confirm a reservation', async () => {
            const expectedResponse = { message: 'Reservation confirmed', confirmed: { _id: id, guestName: 'Test', guestEmail: 't@e.com', checkIn: '', checkOut: '', paymentStatus: 'paid', createdAt: '', updatedAt: '' }, paymentUrl: 'http://pay.com', emailSent: true };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.confirmReservation(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations/res-id-8/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: undefined }),
            });
        });

        it('should confirm reservation with payment method', async () => {
            const expectedResponse = { message: 'Reservation confirmed', confirmed: { _id: id, guestName: 'Test', guestEmail: 't@e.com', checkIn: '', checkOut: '', paymentStatus: 'paid', createdAt: '', updatedAt: '' }, paymentUrl: 'http://pay.com', emailSent: true };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.confirmReservation(token, id, 'stripe');
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations/res-id-8/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ paymentMethod: 'stripe' }),
            });
        });

        it('should throw an error on confirmation failure', async () => {
            mockFailedFetch({ message: 'Confirmation failed' }, 400);

            await expect(api.confirmReservation(token, id)).rejects.toEqual({ message: 'Confirmation failed' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test deleteReservationRequest
    describe('deleteReservationRequest', () => {
        const token = 'admin-token';
        const id = 'req-id-1';
        it('should delete a reservation request', async () => {
            const expectedResponse = { message: 'Request deleted' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteReservationRequest(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations/req-id-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ reason: '' }),
            });
        });

        it('should delete a reservation request with reason', async () => {
            const reason = 'User cancelled';
            const expectedResponse = { message: 'Request deleted' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteReservationRequest(token, id, reason);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations/req-id-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ reason: 'User cancelled' }),
            });
        });

        it('should throw an error on deletion failure', async () => {
            mockFailedFetch({ message: 'Deletion failed' }, 500);

            await expect(api.deleteReservationRequest(token, id)).rejects.toThrow('Failed to delete reservation request');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test deleteConfirmedReservation
    describe('deleteConfirmedReservation', () => {
        const token = 'admin-token';
        const id = 'conf-id-1';
        it('should delete a confirmed reservation', async () => {
            const expectedResponse = { message: 'Reservation cancelled' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteConfirmedReservation(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/conf-id-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ reason: '' }),
            });
        });

        it('should delete a confirmed reservation with reason', async () => {
            const reason = 'Double booking';
            const expectedResponse = { message: 'Reservation cancelled' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteConfirmedReservation(token, id, reason);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/conf-id-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ reason: 'Double booking' }),
            });
        });

        it('should throw an error on deletion failure', async () => {
            mockFailedFetch({ message: 'Cancellation failed' }, 500);

            await expect(api.deleteConfirmedReservation(token, id)).rejects.toThrow('Failed to cancel confirmed reservation');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test updateReservationRequest
    describe('updateReservationRequest', () => {
        const token = 'admin-token';
        const id = 'req-id-2';
        const updateData = { guestName: 'Updated Name', checkIn: '2024-02-01' };

        it('should update a reservation request', async () => {
            const expectedResponse = { _id: id, guestName: 'Updated Name', checkIn: '2024-02-01', guestEmail: '', checkOut: '', nights: 0, totalPrice: 0, createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.updateReservationRequest(token, id, updateData);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations/req-id-2', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify(updateData),
            });
        });

        it('should throw an error on update failure', async () => {
            mockFailedFetch({ message: 'Update failed' }, 400);

            await expect(api.updateReservationRequest(token, id, updateData)).rejects.toEqual({ message: 'Update failed' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test updateConfirmedReservation
    describe('updateConfirmedReservation', () => {
        const token = 'admin-token';
        const id = 'conf-id-2';
        const updateData = { totalPrice: 150, paymentStatus: 'pending' as const };

        it('should update a confirmed reservation', async () => {
            const expectedResponse = { _id: id, guestName: 'Test', guestEmail: 't@e.com', checkIn: '', checkOut: '', totalPrice: 150, paymentStatus: 'pending', createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.updateConfirmedReservation(token, id, updateData);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/reservations-confirmed/conf-id-2', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify(updateData),
            });
        });

        it('should throw an error on update failure', async () => {
            mockFailedFetch({ message: 'Update failed' }, 400);

            await expect(api.updateConfirmedReservation(token, id, updateData)).rejects.toEqual({ message: 'Update failed' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test fetchBlockedDates
    describe('fetchBlockedDates', () => {
        it('should fetch blocked dates', async () => {
            const expectedBlockedDates = [{ _id: 'b1', date: '2024-05-01', reason: 'Maintenance', createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedBlockedDates);

            const result = await api.fetchBlockedDates();
            expect(result).toEqual(expectedBlockedDates);
            expect(mockFetch).toHaveBeenCalledWith('/api/blocked-dates');
        });

        it('should return empty array if fetching fails', async () => {
            mockFailedFetch({ message: 'Server error' }, 500);

            const result = await api.fetchBlockedDates();
            expect(result).toEqual([]);
            expect(mockFetch).toHaveBeenCalledWith('/api/blocked-dates');
        });
    });

    // Test fetchBlockedDatesAdmin
    describe('fetchBlockedDatesAdmin', () => {
        const token = 'admin-token';
        it('should fetch blocked dates for admin', async () => {
            const expectedBlockedDates = [{ _id: 'b2', date: '2024-06-01', reason: 'Personal use', createdAt: '', updatedAt: '' }];
            mockSuccessfulFetch(expectedBlockedDates);

            const result = await api.fetchBlockedDatesAdmin(token);
            expect(result).toEqual(expectedBlockedDates);
            expect(mockFetch).toHaveBeenCalledWith('/api/blocked-dates', {
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if fetching fails', async () => {
            mockFailedFetch({ message: 'Unauthorized' }, 401);

            await expect(api.fetchBlockedDatesAdmin(token)).rejects.toThrow('Failed to fetch blocked dates');
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test createBlockedDate
    describe('createBlockedDate', () => {
        const token = 'admin-token';
        const date = '2024-07-01';
        const reason = 'Holiday';
        it('should create a blocked date', async () => {
            const expectedBlockedDate = { _id: 'b3', date, reason, createdAt: '', updatedAt: '' };
            mockSuccessfulFetch(expectedBlockedDate);

            const result = await api.createBlockedDate(token, date, reason);
            expect(result).toEqual(expectedBlockedDate);
            expect(mockFetch).toHaveBeenCalledWith('/api/blocked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
                body: JSON.stringify({ date, reason }),
            });
        });

        it('should throw an error if creation fails', async () => {
            mockFailedFetch({ message: 'Date already blocked' }, 409);

            await expect(api.createBlockedDate(token, date, reason)).rejects.toEqual({ message: 'Date already blocked' });
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    // Test deleteBlockedDate
    describe('deleteBlockedDate', () => {
        const token = 'admin-token';
        const id = 'b3';
        it('should delete a blocked date', async () => {
            const expectedResponse = { message: 'Blocked date deleted' };
            mockSuccessfulFetch(expectedResponse);

            const result = await api.deleteBlockedDate(token, id);
            expect(result).toEqual(expectedResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/blocked-dates/b3', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
            });
        });

        it('should throw an error if deletion fails', async () => {
            mockFailedFetch({ message: 'Not found' }, 404);

            await expect(api.deleteBlockedDate(token, id)).rejects.toThrow('Failed to unblock date');
            expect(mockFetch).toHaveBeenCalled();
        });
    });
});
