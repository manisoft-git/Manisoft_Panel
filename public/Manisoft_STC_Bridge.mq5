//+------------------------------------------------------------------+
//|                                         Manisoft_STC_Bridge.mq5  |
//|                             Copyright 2026, Manifest Subeno.     |
//|                        https://manisoft-panel-hepk.onrender.com  |
//+------------------------------------------------------------------+
#property copyright   "Manifest Subeno"
#property link        "https://manisoft-panel-hepk.onrender.com"
#property version     "1.00"
#property description "Autonomous Cloud-to-Terminal Execution Bridge for Manisoft STC Bot"
#property strict

#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\SymbolInfo.mqh>

//--- Inputs
input group "=== Cloud Infrastructure ==="
input string   InpCloudUrl        = "https://manisoft-panel-hepk.onrender.com"; // Cloud Mission Control URL
input int      InpPollIntervalSec = 2;                                          // Bridge Poll Frequency (seconds)
input ulong    InpMagicNumber     = 777001;                                     // Magic Identification Number
input ulong    InpSlippagePoints  = 30;                                         // Max Slippage Tolerance (points)

//--- Global Objects
CTrade         ExtTrade;
CPositionInfo  ExtPosition;
CSymbolInfo    ExtSymbol;
datetime       ExtLastSyncTime    = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   ExtTrade.SetExpertMagicNumber(InpMagicNumber);
   ExtTrade.SetDeviationInPoints(InpSlippagePoints);
   ExtTrade.SetTypeFillingBySymbol(_Symbol);

   EventSetTimer(InpPollIntervalSec);
   PrintFormat("[Manisoft STC Bridge] Online. Attached to %s. Target: %s", _Symbol, InpCloudUrl);
   
   // Immediate initial sync
   SyncTelemetry();
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("[Manisoft STC Bridge] Deactivated. Reason code: ", reason);
}

//+------------------------------------------------------------------+
//| Timer event handler                                              |
//+------------------------------------------------------------------+
void OnTimer()
{
   // 1. Process any pending orders queued from the Cloud Mission Control
   PollPendingOrders();

   // 2. Continuous Smart Dynamic Ratchet Trailing SL (15p Initial, 10p trigger, 50% lock)
   ManageSmartTrailingRatchet();

   // 3. Sync account balance, equity, and live positions every 4 seconds (uses TimeLocal for 24/7 weekend continuity)
   if(TimeLocal() - ExtLastSyncTime >= 4)
   {
      SyncTelemetry();
      ExtLastSyncTime = TimeLocal();
   }
}

//+------------------------------------------------------------------+
//| High-Water Mark Smart Trailing Ratchet Manager                   |
//| Rules:                                                           |
//| 1. Initial Stop Loss at 15 pips                                  |
//| 2. At +10 pips profit, shifts SL to lock in +5 pips (50% lock)  |
//| 3. Progressively ratchets SL to lock 50% of peak gained pips     |
//| 4. Strictly monotonic: SL never loosens on profit pullback       |
//+------------------------------------------------------------------+
void ManageSmartTrailingRatchet()
{
   int totalPos = PositionsTotal();
   for(int i = 0; i < totalPos; i++)
   {
      if(ExtPosition.SelectByIndex(i))
      {
         ulong ticket     = ExtPosition.Ticket();
         string sym       = ExtPosition.Symbol();
         long posType     = ExtPosition.PositionType();
         double openPrice = ExtPosition.PriceOpen();
         double currPrice = ExtPosition.PriceCurrent();
         double sl        = ExtPosition.StopLoss();
         double tp        = ExtPosition.TakeProfit();
         int digits       = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);

         double pipSize = 0.0001;
         if(StringFind(sym, "XAU") >= 0 || StringFind(sym, "GOLD") >= 0) pipSize = 0.10;
         else if(StringFind(sym, "XAG") >= 0 || StringFind(sym, "SILVER") >= 0) pipSize = 0.01;
         else if(StringFind(sym, "WTI") >= 0 || StringFind(sym, "OIL") >= 0 || StringFind(sym, "CRUDE") >= 0) pipSize = 0.01;
         else if(StringFind(sym, "JPY") >= 0) pipSize = 0.01;
         else if(digits == 3 || digits == 5) pipSize = 10.0 * SymbolInfoDouble(sym, SYMBOL_POINT);

         double profitPips = 0.0;
         if(posType == POSITION_TYPE_BUY)
            profitPips = (currPrice - openPrice) / pipSize;
         else if(posType == POSITION_TYPE_SELL)
            profitPips = (openPrice - currPrice) / pipSize;

         // Trigger at 10 pips profit
         if(profitPips >= 10.0)
         {
            double lockPips = profitPips * 0.5; // lock half of peak gain
            double targetSl = 0.0;
            bool shouldModify = false;

            if(posType == POSITION_TYPE_BUY)
            {
               targetSl = NormalizeDouble(openPrice + (lockPips * pipSize), digits);
               if(sl <= 0 || targetSl > (sl + (0.5 * pipSize)))
               {
                  shouldModify = true;
               }
            }
            else if(posType == POSITION_TYPE_SELL)
            {
               targetSl = NormalizeDouble(openPrice - (lockPips * pipSize), digits);
               if(sl <= 0 || targetSl < (sl - (0.5 * pipSize)))
               {
                  shouldModify = true;
               }
            }

            if(shouldModify)
            {
               if(ExtTrade.PositionModify(ticket, targetSl, tp))
               {
                  PrintFormat("🛡️ [SMART RATCHET ARMED] Ticket #%I64d (%s) Ratcheted SL to %.5f (+%.1f pips locked)", ticket, sym, targetSl, lockPips);
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Synchronizes MT5 balance, equity, and positions with Render Cloud|
//+------------------------------------------------------------------+
void SyncTelemetry()
{
   double balance   = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity    = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin    = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMarg  = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   long   login     = AccountInfoInteger(ACCOUNT_LOGIN);
   string broker    = AccountInfoString(ACCOUNT_COMPANY);

   string json = StringFormat(
      "{\"account\":%I64d,\"broker\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"margin_free\":%.2f,\"positions\":[",
      login, broker, balance, equity, margin, freeMarg
   );

   int totalPos = PositionsTotal();
   int count = 0;
   for(int i = 0; i < totalPos; i++)
   {
      if(ExtPosition.SelectByIndex(i))
      {
         ulong  ticket    = ExtPosition.Ticket();
         string sym       = ExtPosition.Symbol();
         string type      = (ExtPosition.PositionType() == POSITION_TYPE_BUY) ? "BUY" : "SELL";
         double vol       = ExtPosition.Volume();
         double openPrice = ExtPosition.PriceOpen();
         double currPrice = ExtPosition.PriceCurrent();
         double sl        = ExtPosition.StopLoss();
         double tp        = ExtPosition.TakeProfit();
         double profit    = ExtPosition.Profit();

         if(count > 0) json += ",";
         json += StringFormat(
            "{\"ticket\":%I64d,\"symbol\":\"%s\",\"side\":\"%s\",\"volume\":%.2f,\"open_price\":%.5f,\"current_price\":%.5f,\"sl\":%.5f,\"tp\":%.5f,\"pnl\":%.2f}",
            ticket, sym, type, vol, openPrice, currPrice, sl, tp, profit
         );
         count++;
      }
   }
   json += "]}";

   char postData[];
   char resultData[];
   string resultHeaders;
   StringToCharArray(json, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1); // remove null terminator

   string headers = "Content-Type: application/json\r\nUser-Agent: Manisoft-STC-MT5/1.0\r\n";
   string url = InpCloudUrl + "/api/bridge/sync";

   int res = WebRequest("POST", url, headers, 3000, postData, resultData, resultHeaders);
   if(res == -1)
   {
      int err = GetLastError();
      if(err == 4014) // ERR_FUNCTION_NOT_ALLOWED
      {
         Print("[CRITICAL] WebRequest not allowed! Add '", InpCloudUrl, "' in MT5 Tools -> Options -> Expert Advisors -> Allow WebRequest.");
      }
   }
}

//+------------------------------------------------------------------+
//| Polls pending orders waiting in the Cloud queue                  |
//+------------------------------------------------------------------+
void PollPendingOrders()
{
   char postData[];
   char resultData[];
   string resultHeaders;
   string headers = "User-Agent: Manisoft-STC-MT5/1.0\r\n";
   string url = InpCloudUrl + "/api/bridge/pending";

   int res = WebRequest("GET", url, headers, 3000, postData, resultData, resultHeaders);
   if(res != 200 || ArraySize(resultData) == 0) return;

   string response = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);
   if(StringFind(response, "\"orders\":[") < 0) return;

   // Simple lightweight extraction for JSON orders without heavy 3rd-party libs
   ProcessOrdersJson(response);
}

//+------------------------------------------------------------------+
//| Lightweight parser and dispatcher for orders from JSON           |
//+------------------------------------------------------------------+
void ProcessOrdersJson(const string &json)
{
   // Check for Emergency Killswitch Command
   if(StringFind(json, "\"action\":\"KILLSWITCH\"") >= 0)
   {
      Print("[EMERGENCY] Received KILLSWITCH signal from Cloud Commander!");
      CloseAllPositions();
      ReportFilled("KILLSWITCH", 0, "ALL_CLOSED", 0.0);
      return;
   }

   // Detect single or multiple order patterns
   int pos = StringFind(json, "{\"id\":");
   while(pos >= 0)
   {
      int endPos = StringFind(json, "}", pos);
      if(endPos < 0) break;

      string orderBlock = StringSubstr(json, pos, endPos - pos + 1);
      ExecuteSingleOrder(orderBlock);

      pos = StringFind(json, "{\"id\":", endPos);
   }
}

//+------------------------------------------------------------------+
//| Executes a single order parsed from cloud block                  |
//+------------------------------------------------------------------+
void ExecuteSingleOrder(const string &block)
{
   string orderId = ExtractJsonString(block, "id");
   string action  = ExtractJsonString(block, "action");
   string symbol  = ExtractJsonString(block, "symbol");
   double volume  = ExtractJsonDouble(block, "volume");
   double sl      = ExtractJsonDouble(block, "sl");
   double tp      = ExtractJsonDouble(block, "tp");

   if(action == "MODIFY_SL")
   {
      ulong modTicket = (ulong)ExtractJsonDouble(block, "ticket");
      if(modTicket > 0 && sl > 0)
      {
         bool modOk = ExtTrade.PositionModify(modTicket, sl, tp);
         if(modOk)
         {
            PrintFormat("🛡️ [RATCHET MODIFIED] Ticket #%I64d New SL: %.5f", modTicket, sl);
            ReportFilled(orderId, modTicket, "MODIFIED_SL", sl);
         }
         else
         {
            PrintFormat("⚠️ [RATCHET FAILED] Ticket #%I64d: %s", modTicket, ExtTrade.ResultRetcodeDescription());
            ReportFilled(orderId, modTicket, "MODIFY_FAILED", sl);
         }
      }
      return;
   }

   if(orderId == "" || action == "" || symbol == "" || volume <= 0) return;

   if(!ExtSymbol.Name(symbol))
   {
      PrintFormat("[FAILED] Unknown symbol '%s' for Order #%s", symbol, orderId);
      ReportFilled(orderId, 0, "UNKNOWN_SYMBOL", 0.0);
      return;
   }

   ExtSymbol.RefreshRates();
   ExtTrade.SetTypeFillingBySymbol(symbol);

   bool success = false;
   ulong ticket = 0;
   double fillPrice = 0.0;

   if(action == "BUY")
   {
      double ask = ExtSymbol.Ask();
      if(ask <= 0) ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
      success = ExtTrade.Buy(volume, symbol, ask, sl, tp, "STC-" + orderId);
      ticket = ExtTrade.ResultOrder();
      fillPrice = ExtTrade.ResultPrice();
   }
   else if(action == "SELL")
   {
      double bid = ExtSymbol.Bid();
      if(bid <= 0) bid = SymbolInfoDouble(symbol, SYMBOL_BID);
      success = ExtTrade.Sell(volume, symbol, bid, sl, tp, "STC-" + orderId);
      ticket = ExtTrade.ResultOrder();
      fillPrice = ExtTrade.ResultPrice();
   }

   if(success && ticket > 0)
   {
      PrintFormat("⚡ [FILLED] %s %.2f lots %s @ %.5f | Ticket: #%I64d", action, volume, symbol, fillPrice, ticket);
      ReportFilled(orderId, ticket, "FILLED", fillPrice);
   }
   else
   {
      uint retCode = ExtTrade.ResultRetcode();
      string desc = ExtTrade.ResultRetcodeDescription();
      PrintFormat("❌ [REJECTED] Order #%s (%s %s) error %d: %s", orderId, action, symbol, retCode, desc);
      ReportFilled(orderId, 0, "REJECTED: " + desc, 0.0);
   }
}

//+------------------------------------------------------------------+
//| Liquidates all open positions immediately                        |
//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(ExtPosition.SelectByIndex(i))
      {
         ExtTrade.PositionClose(ExtPosition.Ticket());
      }
   }
}

//+------------------------------------------------------------------+
//| Reports execution confirmation back to Cloud Server              |
//+------------------------------------------------------------------+
void ReportFilled(const string orderId, const ulong ticket, const string status, const double fillPrice)
{
   string json = StringFormat(
      "{\"order_id\":\"%s\",\"ticket\":%I64d,\"status\":\"%s\",\"fill_price\":%.5f}",
      orderId, ticket, status, fillPrice
   );

   char postData[];
   char resultData[];
   string resultHeaders;
   StringToCharArray(json, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1);

   string headers = "Content-Type: application/json\r\nUser-Agent: Manisoft-STC-MT5/1.0\r\n";
   string url = InpCloudUrl + "/api/bridge/filled";

   WebRequest("POST", url, headers, 3000, postData, resultData, resultHeaders);
}

//+------------------------------------------------------------------+
//| Helper: Extract string value from JSON block                     |
//+------------------------------------------------------------------+
string ExtractJsonString(const string &source, const string key)
{
   string pattern = "\"" + key + "\":\"";
   int start = StringFind(source, pattern);
   if(start < 0) return "";
   start += StringLen(pattern);
   int end = StringFind(source, "\"", start);
   if(end < 0) return "";
   return StringSubstr(source, start, end - start);
}

//+------------------------------------------------------------------+
//| Helper: Extract numeric double value from JSON block             |
//+------------------------------------------------------------------+
double ExtractJsonDouble(const string &source, const string key)
{
   string pattern = "\"" + key + "\":";
   int start = StringFind(source, pattern);
   if(start < 0) return 0.0;
   start += StringLen(pattern);
   int end1 = StringFind(source, ",", start);
   int end2 = StringFind(source, "}", start);
   int end = (end1 >= 0 && end1 < end2) ? end1 : end2;
   if(end < 0) end = StringLen(source);
   string valStr = StringSubstr(source, start, end - start);
   StringTrimLeft(valStr);
   StringTrimRight(valStr);
   return StringToDouble(valStr);
}
//+------------------------------------------------------------------+