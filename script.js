const API_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/api/chat";
const STORAGE_KEY = "gai_v1_chats";
let chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentId = null;
let busy = false;

const $ = (id) => document.getElementById(id);
const messagesEl = $("messages"), welcomeEl = $("welcome"), input = $("promptInput");

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); }
function currentChat(){ return chats.find(c => c.id === currentId); }
function newChat(){
  const chat = {id: String(Date.now()), title:"محادثة جديدة", messages:[]};
  chats.unshift(chat); currentId=chat.id; save(); render();
}
function render(){
  const chat=currentChat();
  $("historyList").innerHTML="";
  chats.forEach(c=>{
    const item=document.createElement("div");
    item.className="history-item"+(c.id===currentId?" active":"");
    item.textContent=c.title;
    item.onclick=()=>{currentId=c.id;render();closeMenu();};
    $("historyList").appendChild(item);
  });
  messagesEl.innerHTML="";
  const hasMessages=!!(chat && chat.messages.length);
  welcomeEl.style.display=hasMessages?"none":"block";
  if(chat) chat.messages.forEach(m=>addMessage(m.role,m.content,false));
}
function addMessage(role,content,scroll=true){
  const row=document.createElement("div"); row.className="message "+role;
  const avatar=document.createElement("div"); avatar.className="avatar"; avatar.textContent=role==="user"?"أنت":"G";
  const body=document.createElement("div"); body.className="message-body"; body.textContent=content;
  row.append(avatar,body); messagesEl.appendChild(row);
  if(scroll) $("conversation").scrollTop=$("conversation").scrollHeight;
  return body;
}
function closeMenu(){ $("sidebar").classList.remove("open"); $("overlay").classList.remove("show"); }
async function sendMessage(text){
  if(busy || !text.trim()) return;
  if(!currentChat()) newChat();
  const chat=currentChat();
  const clean=text.trim();
  chat.messages.push({role:"user",content:clean});
  if(chat.messages.length===1) chat.title=clean.slice(0,32);
  save(); render();
  input.value=""; resizeInput();
  busy=true; $("sendBtn").disabled=true;
  const loading=addMessage("assistant","يفكر G-AI...");
  loading.classList.add("typing");
  try{
    const response=await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:chat.messages})
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data.error || "حدث خطأ في الاتصال.");
    const answer=data.reply || "لم يصل رد من النموذج.";
    loading.textContent=answer; loading.classList.remove("typing");
    chat.messages.push({role:"assistant",content:answer}); save();
  }catch(err){
    loading.textContent="تعذر الاتصال: "+err.message+"\nتأكد من إعداد Cloudflare Worker ورابط API.";
    loading.classList.remove("typing");
  }finally{
    busy=false; $("sendBtn").disabled=false; $("conversation").scrollTop=$("conversation").scrollHeight; renderHistoryOnly();
  }
}
function renderHistoryOnly(){
  $("historyList").innerHTML="";
  chats.forEach(c=>{const item=document.createElement("div");item.className="history-item"+(c.id===currentId?" active":"");item.textContent=c.title;item.onclick=()=>{currentId=c.id;render();closeMenu();};$("historyList").appendChild(item);});
}
function resizeInput(){input.style.height="auto";input.style.height=Math.min(input.scrollHeight,180)+"px";}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();sendMessage(input.value);});
input.addEventListener("input",resizeInput);
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("chatForm").requestSubmit();}});
$("newChat").onclick=()=>{newChat();closeMenu();};
$("clearChat").onclick=()=>{if(currentChat()){currentChat().messages=[];currentChat().title="محادثة جديدة";save();render();}};
$("openSidebar").onclick=()=>{$("sidebar").classList.add("open");$("overlay").classList.add("show");};
$("closeSidebar").onclick=closeMenu; $("overlay").onclick=closeMenu;
document.querySelectorAll(".suggestion").forEach(b=>b.onclick=()=>sendMessage(b.dataset.prompt));
if(chats.length){currentId=chats[0].id;}else{newChat();}
render();
