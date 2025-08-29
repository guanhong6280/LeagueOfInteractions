const { summarizeComments } = require('../utils/summaryGeneration');

// Sample test data
const samplePrevSummary = "This skin has received mixed feedback. Players appreciate the vibrant color scheme and smooth animations, but some find the visual effects too flashy for competitive play.";

const sampleNewComments = [
  "The splash art is absolutely stunning! The attention to detail in the background is incredible.",
  "Love the new particle effects, they make the abilities feel more impactful.",
  "The skin feels a bit overpriced for what you get. The model quality is good but not exceptional.",
  "The sound effects are amazing and really enhance the overall experience.",
  "Wish the recall animation was more unique, it feels too similar to the base skin.",
  "The chromas look great and offer good variety for different tastes.",
  "The skin line consistency is perfect, fits well with the overall theme."
];

async function testSummaryGeneration() {
  console.log('🧪 Testing Summary Generation Service\n');
  
  try {
    console.log('📝 Previous Summary:');
    console.log(samplePrevSummary);
    console.log('\n💬 New Comments:');
    sampleNewComments.forEach((comment, index) => {
      console.log(`${index + 1}. ${comment}`);
    });
    
    console.log('\n🔄 Generating updated summary...\n');
    
    const startTime = Date.now();
    const updatedSummary = await summarizeComments(samplePrevSummary, sampleNewComments);
    const endTime = Date.now();
    
    console.log('✅ Updated Summary:');
    console.log(updatedSummary);
    console.log(`\n⏱️  Generation time: ${endTime - startTime}ms`);
    console.log(`📊 Summary length: ${updatedSummary.length} characters`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Test with empty previous summary
    console.log('\n🔄 Testing with empty previous summary...\n');
    try {
      const startTime = Date.now();
      const newSummary = await summarizeComments('', sampleNewComments);
      const endTime = Date.now();
      
      console.log('✅ New Summary:');
      console.log(newSummary);
      console.log(`\n⏱️  Generation time: ${endTime - startTime}ms`);
      console.log(`📊 Summary length: ${newSummary.length} characters`);
      
    } catch (secondError) {
      console.error('❌ Second test also failed:', secondError.message);
    }
  }
}

// Run the test
testSummaryGeneration();
