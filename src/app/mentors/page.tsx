'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Calendar,
  Star,
  Video,
  Clock,
  Award,
  ExternalLink,
  Plus,
  User,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  type Mentor,
  type ChatMessage,
  type ChatRoom,
  getMentors,
  getMockMentors,
  createChatRoom,
  sendMessage,
  subscribeToMessages,
  getUserChatRooms,
  bookMentorshipSession,
} from '@/lib/mentor-chat-service';
import { searchMentors, type GoogleSearchResult } from '@/lib/google-search-service';

export default function MentorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [view, setView] = useState<'mentors' | 'chats'>('mentors');
  const [onlineMentors, setOnlineMentors] = useState<GoogleSearchResult[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMentors();
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChatRoom) {
      const unsubscribe = subscribeToMessages(selectedChatRoom.id, (updatedMessages) => {
        setMessages(updatedMessages);
      });
      return () => unsubscribe();
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMentors = async () => {
    setLoading(true);
    try {
      const fetchedMentors = await getMentors();
      const allMentors = fetchedMentors.length > 0 ? fetchedMentors : getMockMentors();
      setMentors(allMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
      setMentors(getMockMentors());
    } finally {
      setLoading(false);
    }
  };

  const loadChatRooms = async () => {
    if (!user) return;
    try {
      const rooms = await getUserChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const findOnlineMentors = async () => {
    setLoadingOnline(true);
    try {
      toast({
        title: 'Searching...',
        description: 'Finding mentors online for you',
      });

      const query = searchQuery || 'career mentor';
      const results = await searchMentors(query, { numResults: 10 });
      
      setOnlineMentors(results);
      
      toast({
        title: 'Success!',
        description: `Found ${results.length} online mentors`,
      });
    } catch (error) {
      console.error('Error finding online mentors:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for online mentors',
        variant: 'destructive',
      });
    } finally {
      setLoadingOnline(false);
    }
  };

  const handleStartChat = async (mentor: Mentor) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to chat with mentors',
        variant: 'destructive',
      });
      return;
    }

    try {
      const chatRoomId = await createChatRoom(mentor.id);
      // Find the created chat room
      const rooms = await getUserChatRooms();
      const chatRoom = rooms.find(r => r.id === chatRoomId);
      if (chatRoom) {
        setSelectedChatRoom(chatRoom);
        setSelectedMentor(mentor);
        setView('chats');
        loadChatRooms();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start chat',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChatRoom || !newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(selectedChatRoom.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedMentor) return;

    try {
      const formData = new FormData(e.currentTarget);
      const sessionData = {
        title: formData.get('title') as string,
        description: (formData.get('notes') as string) || '',
        scheduledAt: new Date(formData.get('date') as string).toISOString(),
        duration: parseInt(formData.get('duration') as string),
      };

      await bookMentorshipSession(selectedMentor.id, sessionData);

      toast({
        title: 'Session Booked!',
        description: 'Your mentorship session has been scheduled and added to your calendar',
      });

      setIsBookingModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book session',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-indigo-400" />
              Find a Mentor
            </h1>
            <p className="text-slate-400 mt-1">
              Connect with industry experts for guidance and career advice
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setView('mentors')}
              variant={view === 'mentors' ? 'default' : 'outline'}
              className={
                view === 'mentors'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700'
              }
            >
              <User className="w-4 h-4 mr-2" />
              Browse Mentors
            </Button>
            <Button
              onClick={() => setView('chats')}
              variant={view === 'chats' ? 'default' : 'outline'}
              className={
                view === 'chats'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700'
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              My Chats ({chatRooms.length})
            </Button>
          </div>
        </motion.div>

        {/* Online Mentor Search */}
        {view === 'mentors' && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for mentors online (e.g., 'Software Engineering mentor LinkedIn')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findOnlineMentors()}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <Button
                  onClick={findOnlineMentors}
                  disabled={loadingOnline}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {loadingOnline ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Online
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Online Mentors Results */}
        {view === 'mentors' && onlineMentors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Online Mentors</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  {onlineMentors.length} results
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onlineMentors.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-900/50 border-blue-500/30 backdrop-blur-sm hover:border-blue-500/50 transition-all h-full flex flex-col">
                    <CardHeader className="flex-1">
                      <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                        {result.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-3">
                        {result.snippet}
                      </p>
                      <p className="text-xs text-blue-400 mt-2 truncate">
                        {result.source}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(result.link, '_blank')}
                        className="w-full bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mentors View */}
        {view === 'mentors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"
                />
                <p className="text-slate-400 mt-4">Loading mentors...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {mentors.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/50 transition-all h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={mentor.photoURL} alt={mentor.name} />
                            <AvatarFallback className="bg-indigo-600 text-white text-xl">
                              {mentor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                            <p className="text-sm text-slate-400">{mentor.title}</p>
                            <p className="text-sm text-indigo-400">{mentor.company}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-slate-400 text-sm mb-4">{mentor.bio}</p>

                        {/* Expertise */}
                        <div className="mb-4">
                          <p className="text-sm text-slate-500 mb-2">Expertise:</p>
                          <div className="flex flex-wrap gap-2">
                            {mentor.expertise.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-300">{mentor.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{mentor.reviewCount} reviews</span>
                          </div>
                        </div>

                        {/* Availability & Price */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Availability:</span>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-400 border-green-500/30"
                            >
                              {mentor.availability.days.join(', ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Rate:</span>
                            <span className="text-white font-semibold">
                              {mentor.pricing.free ? 'FREE' : `₹${mentor.pricing.hourlyRate}/hr`}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <Button
                            onClick={() => handleStartChat(mentor)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            size="sm"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setIsBookingModalOpen(true);
                            }}
                            variant="outline"
                            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700"
                            size="sm"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Chat View */}
        {view === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Chat List */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto h-[calc(100vh-350px)]">
                  {chatRooms.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start chatting with a mentor!</p>
                    </div>
                  ) : (
                    chatRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => {
                          setSelectedChatRoom(room);
                          const mentor = mentors.find((m) => m.id === room.mentorId);
                          setSelectedMentor(mentor || null);
                        }}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 ${
                          selectedChatRoom?.id === room.id ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {room.mentorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium">{room.mentorName}</p>
                          <p className="text-sm text-slate-400 truncate">{room.lastMessage || 'No messages yet'}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden flex flex-col">
              {selectedChatRoom && selectedMentor ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedMentor.photoURL} alt={selectedMentor.name} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {selectedMentor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{selectedMentor.name}</p>
                          <p className="text-sm text-slate-400">{selectedMentor.title}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setIsBookingModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.uid
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t border-slate-700/50 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                      />
                      <Button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Book Session Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Book Mentorship Session</DialogTitle>
            </DialogHeader>
            {selectedMentor && (
              <form onSubmit={handleBookSession} className="space-y-4 mt-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedMentor.photoURL} alt={selectedMentor.name} />
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {selectedMentor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{selectedMentor.name}</p>
                    <p className="text-sm text-slate-400">{selectedMentor.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Session Title *</label>
                  <Input
                    name="title"
                    required
                    placeholder="e.g., Career Guidance Session"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Date & Time *</label>
                    <Input
                      name="date"
                      type="datetime-local"
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Duration (min) *</label>
                    <Select name="duration" required>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="30" className="text-white">30 minutes</SelectItem>
                        <SelectItem value="60" className="text-white">60 minutes</SelectItem>
                        <SelectItem value="90" className="text-white">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Notes (optional)</label>
                  <Textarea
                    name="notes"
                    rows={3}
                    placeholder="What would you like to discuss?"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
