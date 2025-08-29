const { spawn } = require('child_process');
const path = require('path');

// Test scripts to run in order
const testScripts = [
  'testSQSEnvironment.js',
  'testSQSOperations.js', 
  'testQueueIntegration.js',
  'testEndToEndWorker.js'
];

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function runTest(scriptName) {
  return new Promise((resolve) => {
    console.log(`\n🚀 Running ${scriptName}...`);
    console.log('='.repeat(50));
    
    const testProcess = spawn('node', [path.join(__dirname, scriptName)], {
      stdio: 'pipe',
      env: { ...process.env }
    });
    
    let output = '';
    let errorOutput = '';
    
    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });
    
    testProcess.on('close', (code) => {
      const success = code === 0;
      const result = {
        script: scriptName,
        success,
        code,
        output,
        errorOutput
      };
      
      results.tests.push(result);
      
      if (success) {
        results.passed++;
        console.log(`\n✅ ${scriptName} PASSED`);
      } else {
        results.failed++;
        console.log(`\n❌ ${scriptName} FAILED (exit code: ${code})`);
      }
      
      resolve(result);
    });
    
    testProcess.on('error', (error) => {
      const result = {
        script: scriptName,
        success: false,
        code: -1,
        output,
        errorOutput: error.message
      };
      
      results.tests.push(result);
      results.failed++;
      
      console.log(`\n💥 ${scriptName} ERROR: ${error.message}`);
      resolve(result);
    });
  });
}

async function runAllTests() {
  console.log('🧪 SQS Integration Test Suite');
  console.log('='.repeat(50));
  console.log('This will test your SQS implementation step by step.\n');
  
  // Check if we're in the right directory
  if (!process.env.SUMMARY_QUEUE_URL) {
    console.log('⚠️  SUMMARY_QUEUE_URL not set in environment variables');
    console.log('💡 Some tests may fail or be skipped');
  }
  
  console.log('📋 Test Plan:');
  testScripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script}`);
  });
  
  console.log('\n🎯 Starting tests...\n');
  
  // Run tests sequentially
  for (const script of testScripts) {
    await runTest(script);
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.script} (exit code: ${test.code})`);
        if (test.errorOutput) {
          console.log(`     Error: ${test.errorOutput.trim()}`);
        }
      });
  }
  
  console.log('\n💡 Next Steps:');
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Your SQS integration is working correctly.');
    console.log('🚀 You can now start the worker: node scripts/startWorker.js');
  } else {
    console.log('🔧 Some tests failed. Please fix the issues before running the worker.');
    console.log('📖 Check the error messages above for guidance.');
  }
  
  return results.failed === 0;
}

// Run all tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
