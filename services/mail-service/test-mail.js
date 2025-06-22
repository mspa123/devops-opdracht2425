// Test script voor mail service
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3006/api/mail';

// Test data
const testData = {
    registration: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testPassword123'
    },
    contestResults: {
        targetOwnerEmail: 'owner@example.com',
        contestTitle: 'Test Contest',
        endDate: new Date().toISOString(),
        description: 'Dit is een test contest',
        participants: [
            {
                email: 'user1@example.com',
                name: 'User One',
                score: 85,
                rank: 1,
                isWinner: true,
                submissionDate: new Date().toISOString()
            },
            {
                email: 'user2@example.com',
                name: 'User Two',
                score: 75,
                rank: 2,
                isWinner: false,
                submissionDate: new Date().toISOString()
            }
        ],
        totalParticipants: 2,
        totalSubmissions: 2,
        averageScore: 80,
        winnerName: 'User One',
        winnerScore: 85
    },
    individualScore: {
        participantEmail: 'user@example.com',
        participantName: 'Test User',
        contestTitle: 'Test Contest',
        score: 85,
        position: 1,
        totalParticipants: 5,
        averageScore: 75,
        highestScore: 85,
        submissionDate: new Date().toISOString(),
        isWinner: true
    }
};

// Test functies
async function testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function testRegistrationEmail() {
    console.log('📧 Testing registration email...');
    try {
        const response = await fetch(`${BASE_URL}/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData.registration)
        });
        const data = await response.json();
        console.log('✅ Registration email:', data);
        return true;
    } catch (error) {
        console.error('❌ Registration email failed:', error.message);
        return false;
    }
}

async function testContestResultsEmail() {
    console.log('🏆 Testing contest results email...');
    try {
        const response = await fetch(`${BASE_URL}/contest-results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData.contestResults)
        });
        const data = await response.json();
        console.log('✅ Contest results email:', data);
        return true;
    } catch (error) {
        console.error('❌ Contest results email failed:', error.message);
        return false;
    }
}

async function testIndividualScoreEmail() {
    console.log('📊 Testing individual score email...');
    try {
        const response = await fetch(`${BASE_URL}/individual-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData.individualScore)
        });
        const data = await response.json();
        console.log('✅ Individual score email:', data);
        return true;
    } catch (error) {
        console.error('❌ Individual score email failed:', error.message);
        return false;
    }
}

async function testTestEmail() {
    console.log('🧪 Testing test email...');
    try {
        const response = await fetch(`${BASE_URL}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        const data = await response.json();
        console.log('✅ Test email:', data);
        return true;
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
        return false;
    }
}

// Main test functie
async function runTests() {
    console.log('🚀 Starting mail service tests...\n');
    
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Registration Email', fn: testRegistrationEmail },
        { name: 'Contest Results Email', fn: testContestResultsEmail },
        { name: 'Individual Score Email', fn: testIndividualScoreEmail },
        { name: 'Test Email', fn: testTestEmail }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n--- ${test.name} ---`);
        const success = await test.fn();
        results.push({ name: test.name, success });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wacht 1 seconde tussen tests
    }
    
    // Resultaten samenvatten
    console.log('\n📋 Test Results:');
    console.log('================');
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the logs above.');
    }
}

// Start tests als script direct wordt uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { runTests }; 