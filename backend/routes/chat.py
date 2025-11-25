from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# Initialize Google Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!")
    print("⚠️  Please create a .env file in the backend directory with your API key")
    USE_AI = False
else:


try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    
    # List available models to see what's accessible
    print("🔍 Checking available Gemini models...")
    available_models = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                # Skip experimental models (they have lower quotas)
                if '-exp' not in m.name:
                    available_models.append(m.name)
                    print(f"  ✓ {m.name}")
                else:
                    print(f"  ⊘ {m.name} (experimental - skipped)")
    except:
        pass
    
    # Prefer stable models in this order
    preferred_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    
    # Try to use preferred models first
    model_to_use = None
    for pref in preferred_models:
        for avail in available_models:
            if pref in avail:
                model_to_use = avail.replace('models/', '')
                break
        if model_to_use:
            break
    
    # If no preferred model found, use first available
    if not model_to_use and available_models:
        model_to_use = available_models[0].replace('models/', '')
    
    if model_to_use:
        model = genai.GenerativeModel(model_to_use)
        USE_AI = True
        print(f"✅ Gemini AI initialized with: {model_to_use}")
    else:
        raise Exception("No compatible Gemini model found")
            
except Exception as e:
    print(f"❌ Gemini initialization error: {e}")
    print("⚠️  Falling back to knowledge base mode")
    USE_AI = False

# System prompt for the AI
SYSTEM_PROMPT = """You are a helpful cryptocurrency and blockchain expert assistant. Your role is to:

1. Explain cryptocurrency concepts clearly and accurately
2. Provide information about Bitcoin, Ethereum, and other cryptocurrencies
3. Help users understand blockchain technology, DeFi, NFTs, and Web3
4. Offer trading tips and risk management advice
5. Explain technical terms in simple language

Guidelines:
- Be concise but informative (keep responses under 200 words unless asked for detail)
- Use examples when helpful
- Warn about risks when discussing trading
- Never provide financial advice, only educational information
- Encourage users to do their own research (DYOR)"""

# Fallback knowledge base
CRYPTO_KNOWLEDGE = {
    "bitcoin": "Bitcoin (BTC) is the first cryptocurrency, created in 2009 by Satoshi Nakamoto. It's a decentralized digital currency using blockchain technology with a maximum supply of 21 million coins.",
    "ethereum": "Ethereum (ETH) is a decentralized platform for smart contracts and dApps, created by Vitalik Buterin in 2015. It's the foundation for most DeFi and NFT projects.",
    "blockchain": "A blockchain is a distributed ledger that records transactions across multiple computers, making it nearly impossible to alter retroactively. Each block contains transaction data and a cryptographic hash.",
    "defi": "DeFi (Decentralized Finance) refers to financial services on blockchain without traditional intermediaries. Includes lending, borrowing, DEXs, yield farming, and staking.",
    "nft": "NFT (Non-Fungible Token) is a unique digital asset representing ownership of specific content on the blockchain. Used for digital art, collectibles, gaming items, and more.",
}

def get_fallback_response(message: str) -> str:
    """Fallback response when AI is not available"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm your crypto learning assistant. Ask me anything about cryptocurrency, blockchain, or trading!"
    
    for keyword, info in CRYPTO_KNOWLEDGE.items():
        if keyword in message_lower:
            return info
    
    return "I can help you learn about Bitcoin, Ethereum, blockchain, DeFi, NFTs, and trading. Try asking about one of these topics!"

@router.post("/chat")
def chat(request: ChatRequest):
    """AI chatbot endpoint with Google Gemini"""
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Try to use Gemini AI
    if USE_AI:
        try:
            # Create the full prompt
            full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {request.message}\n\nProvide a helpful, educational response:"
            
            # Generate response using the correct method
            response = model.generate_content(full_prompt)
            
            # Extract the text from the response
            ai_response = response.text
            
            return {
                "success": True,
                "response": ai_response,
                "mode": "gemini_ai"
            }
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            # Fall back to knowledge base
            pass
    
    # Use fallback knowledge base
    fallback_response = get_fallback_response(request.message)
    
    return {
        "success": True,
        "response": fallback_response,
        "mode": "knowledge_base"
    }
