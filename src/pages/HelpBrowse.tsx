import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Clock, User, HandHeart, Users, Eye, List, Upload, X, Edit, Trash2, LogIn } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const HELP_TYPES = [
  'น้ำ/อาหาร',
  'ยา/เวชภัณฑ์',
  'เสื้อผ้า',
  'ที่พักพิง',
  'อพยพ',
  'ซ่อมแซม',
  'แรงงาน',
  'เงินช่วยเหลือ',
  'อื่นๆ'
];

const SERVICE_TYPES = [
  'ทำความสะอาด',
  'ซ่อมแซม',
  'ขับรถ/ขนส่ง',
  'ทำอาหาร',
  'บริจาคเงิน',
  'บริจาคสิ่งของ',
  'ให้คำปรึกษา',
  'อาสาทั่วไป',
  'อื่นๆ'
];

export default function HelpBrowse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'request-form' | 'offer-form' | 'view-requests' | 'view-offers'>('request-form');
  
  useEffect(() => {
    if (!user && (activeTab === 'request-form' || activeTab === 'offer-form')) {
      toast.error('กรุณาเข้าสู่ระบบก่อนโพสต์');
    }
  }, [user, activeTab]);
  
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    helpTypes: [] as string[],
    budget: '',
    contactName: '',
    contactPhone: '',
    contactMethod: '',
    locationAddress: '',
    imageFiles: [] as File[]
  });

  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    servicesOffered: [] as string[],
    capacity: '',
    contactInfo: '',
    contactMethod: '',
    availability: '',
    locationArea: '',
    skills: ''
  });

  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: helpRequests = [], isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['help-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: helpOffers = [], isLoading: loadingOffers, refetch: refetchOffers } = useQuery({
    queryKey: ['help-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_offers')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: myRequests = [], refetch: refetchMyRequests } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: myOffers = [], refetch: refetchMyOffers } = useQuery({
    queryKey: ['my-offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('help_offers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนโพสต์');
      navigate('/auth');
      return;
    }
    
    if (!requestForm.title || !requestForm.description || !requestForm.contactName) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoadingRequest(true);
    try {
      const phones = requestForm.contactPhone.split(',').map(p => p.trim()).filter(Boolean);
      
      // Upload images if any
      const imageUrls: string[] = [];
      if (requestForm.imageFiles.length > 0) {
        for (const file of requestForm.imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('help-images')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            toast.error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('help-images')
            .getPublicUrl(filePath);
          
          imageUrls.push(publicUrl);
        }
      }
      
      if (editingRequest) {
        // Update existing request
        const { error } = await supabase
          .from('help_requests')
          .update({
            title: requestForm.title,
            description: requestForm.description,
            help_types: requestForm.helpTypes,
            budget: requestForm.budget || null,
            contact_name: requestForm.contactName,
            contact_phone: phones.length > 0 ? phones : null,
            contact_method: requestForm.contactMethod || null,
            location_address: requestForm.locationAddress || null,
            image_urls: imageUrls.length > 0 ? imageUrls : editingRequest.image_urls
          })
          .eq('id', editingRequest.id);

        if (error) throw error;
        toast.success('อัพเดทคำขอความช่วยเหลือเรียบร้อยแล้ว');
        setEditingRequest(null);
      } else {
        // Create new request
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('help_requests')
          .insert({
            title: requestForm.title,
            description: requestForm.description,
            help_types: requestForm.helpTypes,
            budget: requestForm.budget || null,
            contact_name: requestForm.contactName,
            contact_phone: phones.length > 0 ? phones : null,
            contact_method: requestForm.contactMethod || null,
            location_address: requestForm.locationAddress || null,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
            user_id: user?.id || null
          });

        if (error) throw error;
        toast.success('บันทึกคำขอความช่วยเหลือเรียบร้อยแล้ว');
      }
      setRequestForm({
        title: '',
        description: '',
        helpTypes: [],
        budget: '',
        contactName: '',
        contactPhone: '',
        contactMethod: '',
        locationAddress: '',
        imageFiles: []
      });
      refetchRequests();
      refetchMyRequests();
      setActiveTab('request-form');
    } catch (error) {
      console.error('Error creating help request:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนโพสต์');
      navigate('/auth');
      return;
    }
    
    if (!offerForm.name || !offerForm.description || !offerForm.contactInfo) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoadingOffer(true);
    try {
      if (editingOffer) {
        // Update existing offer
        const { error } = await supabase
          .from('help_offers')
          .update({
            name: offerForm.name,
            description: offerForm.description,
            services_offered: offerForm.servicesOffered,
            capacity: offerForm.capacity || null,
            contact_info: offerForm.contactInfo,
            contact_method: offerForm.contactMethod || null,
            availability: offerForm.availability || null,
            location_area: offerForm.locationArea || null,
            skills: offerForm.skills || null
          })
          .eq('id', editingOffer.id);

        if (error) throw error;
        toast.success('อัพเดทข้อเสนอความช่วยเหลือเรียบร้อยแล้ว');
        setEditingOffer(null);
      } else {
        // Create new offer
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('help_offers')
          .insert({
            name: offerForm.name,
            description: offerForm.description,
            services_offered: offerForm.servicesOffered,
            capacity: offerForm.capacity || null,
            contact_info: offerForm.contactInfo,
            contact_method: offerForm.contactMethod || null,
            availability: offerForm.availability || null,
            location_area: offerForm.locationArea || null,
            skills: offerForm.skills || null,
            user_id: user?.id || null
          });

        if (error) throw error;
        toast.success('บันทึกข้อเสนอความช่วยเหลือเรียบร้อยแล้ว');
      }
      setOfferForm({
        name: '',
        description: '',
        servicesOffered: [],
        capacity: '',
        contactInfo: '',
        contactMethod: '',
        availability: '',
        locationArea: '',
        skills: ''
      });
      refetchOffers();
      refetchMyOffers();
      setActiveTab('offer-form');
    } catch (error) {
      console.error('Error creating help offer:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingOffer(false);
    }
  };

  const toggleHelpType = (type: string) => {
    setRequestForm(prev => ({
      ...prev,
      helpTypes: prev.helpTypes.includes(type)
        ? prev.helpTypes.filter(t => t !== type)
        : [...prev.helpTypes, type]
    }));
  };

  const toggleService = (service: string) => {
    setOfferForm(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคำขอความช่วยเหลือนี้?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบคำขอความช่วยเหลือเรียบร้อยแล้ว');
      refetchMyRequests();
      refetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อเสนอความช่วยเหลือนี้?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('help_offers')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบข้อเสนอความช่วยเหลือเรียบร้อยแล้ว');
      refetchMyOffers();
      refetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setDeletingId(null);
    }
  };

  const startEditRequest = (request: any) => {
    setRequestForm({
      title: request.title,
      description: request.description,
      helpTypes: request.help_types || [],
      budget: request.budget || '',
      contactName: request.contact_name,
      contactPhone: request.contact_phone?.join(', ') || '',
      contactMethod: request.contact_method || '',
      locationAddress: request.location_address || '',
      imageFiles: []
    });
    setEditingRequest(request);
  };

  const startEditOffer = (offer: any) => {
    setOfferForm({
      name: offer.name,
      description: offer.description,
      servicesOffered: offer.services_offered || [],
      capacity: offer.capacity || '',
      contactInfo: offer.contact_info,
      contactMethod: offer.contact_method || '',
      availability: offer.availability || '',
      locationArea: offer.location_area || '',
      skills: offer.skills || ''
    });
    setEditingOffer(offer);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            โพสต์ความต้องการความช่วยเหลือของคุณ หรือเสนอให้ความช่วยเหลือ
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full max-w-4xl grid-cols-4 mb-8">
            <TabsTrigger value="request-form" className="gap-2">
              <HandHeart className="w-4 h-4" />
              ขอความช่วยเหลือ
            </TabsTrigger>
            <TabsTrigger value="offer-form" className="gap-2">
              <Users className="w-4 h-4" />
              เสนอให้ความช่วยเหลือ
            </TabsTrigger>
            <TabsTrigger value="view-requests" className="gap-2">
              <Eye className="w-4 h-4" />
              ดูการขอความช่วยเหลือ
            </TabsTrigger>
            <TabsTrigger value="view-offers" className="gap-2">
              <List className="w-4 h-4" />
              ดูการให้ความช่วยเหลือ
            </TabsTrigger>
          </TabsList>

          {/* Request Form Tab */}
          <TabsContent value="request-form">
            {/* My Requests Cards - show above the form so it's immediately visible */}
            {myRequests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">คำขอความช่วยเหลือของคุณ</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {myRequests.map((request) => (
                    <Card key={request.id} className="relative hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditRequest(request)}
                              disabled={deletingId === request.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRequest(request.id)}
                              disabled={deletingId === request.id}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.description}
                        </p>
                        {request.image_urls && request.image_urls.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {request.image_urls.map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`รูปภาพ ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                        {request.help_types && request.help_types.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {request.help_types.map((type: string) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{request.contact_name}</span>
                          </div>
                          {request.contact_phone && request.contact_phone.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{request.contact_phone.join(', ')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(request.created_at!), {
                                addSuffix: true,
                                locale: th
                              })}
                            </span>
                          </div>
                        </div>
                        {request.budget && (
                          <div className="pt-2 border-t">
                            <span className="text-sm font-medium">งบประมาณ: </span>
                            <span className="text-sm text-muted-foreground">{request.budget}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>ขอความช่วยเหลือ</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      หัวข้อ / สรุปสั้นๆ <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={requestForm.title}
                      onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                      placeholder="เช่น: ต้องการบริการช่วยยกต้นไม้ ต้องการบริการล้างบ้าน ต้องการช่างไฟ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Upload className="w-4 h-4 inline mr-1" />
                      อัพโหลดรูปภาพ (ถ้ามี)
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setRequestForm({ ...requestForm, imageFiles: files });
                      }}
                      className="cursor-pointer"
                    />
                    {requestForm.imageFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {requestForm.imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = requestForm.imageFiles.filter((_, i) => i !== index);
                                setRequestForm({ ...requestForm, imageFiles: newFiles });
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      รายละเอียด <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="อธิบายสถานการณ์และความต้องการของคุณโดยละเอียด..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      ประเภทความช่วยเหลือที่ต้องการ
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {HELP_TYPES.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`req-${type}`}
                            checked={requestForm.helpTypes.includes(type)}
                            onCheckedChange={() => toggleHelpType(type)}
                          />
                          <label htmlFor={`req-${type}`} className="text-sm cursor-pointer">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      งบประมาณ / จำนวนเงินที่ต้องการ (ถ้ามี)
                    </label>
                    <Input
                      value={requestForm.budget}
                      onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
                      placeholder="เช่น: 5,000 บาท"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ชื่อผู้ติดต่อ <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={requestForm.contactName}
                      onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      เบอร์โทรติดต่อ
                    </label>
                    <Input
                      value={requestForm.contactPhone}
                      onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                      placeholder="08X-XXX-XXXX (คั่นด้วย , ถ้ามีหลายเบอร์)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ช่องทางติดต่อที่ต้องการ
                    </label>
                    <Input
                      value={requestForm.contactMethod}
                      onChange={(e) => setRequestForm({ ...requestForm, contactMethod: e.target.value })}
                      placeholder="เช่น: โทรศัพท์, LINE, Facebook"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      ที่อยู่ / สถานที่
                    </label>
                    <Textarea
                      value={requestForm.locationAddress}
                      onChange={(e) => setRequestForm({ ...requestForm, locationAddress: e.target.value })}
                      placeholder="ที่อยู่หรือสถานที่ที่ต้องการความช่วยเหลือ"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loadingRequest}
                    className="w-full"
                  >
                    {loadingRequest ? 'กำลังบันทึก...' : editingRequest ? 'อัพเดท' : 'ส่งคำขอความช่วยเหลือ'}
                  </Button>

                  {editingRequest && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingRequest(null);
                        setRequestForm({
                          title: '',
                          description: '',
                          helpTypes: [],
                          budget: '',
                          contactName: '',
                          contactPhone: '',
                          contactMethod: '',
                          locationAddress: '',
                          imageFiles: []
                        });
                      }}
                      className="w-full"
                    >
                      ยกเลิกการแก้ไข
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offer Form Tab */}
          <TabsContent value="offer-form">
            {/* My Offers Cards - show above the form so it's immediately visible */}
            {myOffers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">ข้อเสนอความช่วยเหลือของคุณ</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {myOffers.map((offer) => (
                    <Card key={offer.id} className="relative hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg">{offer.name}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditOffer(offer)}
                              disabled={deletingId === offer.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOffer(offer.id)}
                              disabled={deletingId === offer.id}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offer.description}
                        </p>
                        {offer.services_offered && offer.services_offered.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {offer.services_offered.map((service: string) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          {offer.capacity && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{offer.capacity}</span>
                            </div>
                          )}
                          {offer.skills && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-medium">ทักษะ:</span>
                              <span>{offer.skills}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{offer.contact_info}</span>
                          </div>
                          {offer.location_area && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{offer.location_area}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(offer.created_at!), {
                                addSuffix: true,
                                locale: th
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>เสนอให้ความช่วยเหลือ</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOfferSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ชื่อ / นามแฝง <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={offerForm.name}
                      onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                      placeholder="ชื่อหรือนามแฝงของคุณ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      รายละเอียดการให้ความช่วยเหลือ <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      placeholder="อธิบายความช่วยเหลือที่คุณสามารถให้ได้..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      ประเภทความช่วยเหลือที่สามารถให้ได้
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SERVICE_TYPES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={`offer-${service}`}
                            checked={offerForm.servicesOffered.includes(service)}
                            onCheckedChange={() => toggleService(service)}
                          />
                          <label htmlFor={`offer-${service}`} className="text-sm cursor-pointer">
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ความสามารถ / จำนวนคน / ทรัพยากร
                    </label>
                    <Input
                      value={offerForm.capacity}
                      onChange={(e) => setOfferForm({ ...offerForm, capacity: e.target.value })}
                      placeholder="เช่น: 3 คน, มีรถกระบะ 1 คัน"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ทักษะพิเศษ / อุปกรณ์
                    </label>
                    <Input
                      value={offerForm.skills}
                      onChange={(e) => setOfferForm({ ...offerForm, skills: e.target.value })}
                      placeholder="เช่น: ช่างไฟฟ้า, มีเครื่องสูบน้ำ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ข้อมูลติดต่อ <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={offerForm.contactInfo}
                      onChange={(e) => setOfferForm({ ...offerForm, contactInfo: e.target.value })}
                      placeholder="เบอร์โทร, LINE ID, Facebook"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ช่องทางติดต่อที่ต้องการ
                    </label>
                    <Input
                      value={offerForm.contactMethod}
                      onChange={(e) => setOfferForm({ ...offerForm, contactMethod: e.target.value })}
                      placeholder="เช่น: โทรศัพท์, LINE, Facebook"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ช่วงเวลาที่สะดวก
                    </label>
                    <Input
                      value={offerForm.availability}
                      onChange={(e) => setOfferForm({ ...offerForm, availability: e.target.value })}
                      placeholder="เช่น: ทุกวันเสาร์-อาทิตย์, 18:00-20:00 น."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      พื้นที่ที่สามารถช่วยได้
                    </label>
                    <Input
                      value={offerForm.locationArea}
                      onChange={(e) => setOfferForm({ ...offerForm, locationArea: e.target.value })}
                      placeholder="เช่น: เชียงใหม่, หาดใหญ่"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loadingOffer}
                    className="w-full"
                  >
                    {loadingOffer ? 'กำลังบันทึก...' : editingOffer ? 'อัพเดท' : 'ส่งข้อเสนอความช่วยเหลือ'}
                  </Button>

                  {editingOffer && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingOffer(null);
                        setOfferForm({
                          name: '',
                          description: '',
                          servicesOffered: [],
                          capacity: '',
                          contactInfo: '',
                          contactMethod: '',
                          availability: '',
                          locationArea: '',
                          skills: ''
                        });
                      }}
                      className="w-full"
                    >
                      ยกเลิกการแก้ไข
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Requests Tab */}
          <TabsContent value="view-requests" className="space-y-4">
            {loadingRequests ? (
              <div className="text-center py-12 text-muted-foreground">กำลังโหลด...</div>
            ) : helpRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีรายการผู้ต้องการความช่วยเหลือ
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">หัวข้อ</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead className="w-[150px]">ประเภท</TableHead>
                      <TableHead className="w-[150px]">ชื่อผู้ติดต่อ</TableHead>
                      <TableHead className="w-[120px]">เบอร์โทร</TableHead>
                      <TableHead className="w-[200px]">ที่อยู่</TableHead>
                      <TableHead className="w-[100px]">งบประมาณ</TableHead>
                      <TableHead className="w-[100px]">สถานะ</TableHead>
                      <TableHead className="w-[120px]">เวลา</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {helpRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <p className="text-sm line-clamp-2">{request.description}</p>
                            {request.image_urls && request.image_urls.length > 0 && (
                              <div className="flex gap-1">
                                {request.image_urls.slice(0, 3).map((url: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`รูปภาพ ${idx + 1}`}
                                    className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ))}
                                {request.image_urls.length > 3 && (
                                  <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-xs">
                                    +{request.image_urls.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.help_types && request.help_types.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {request.help_types.slice(0, 2).map((type: string) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                              {request.help_types.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{request.help_types.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{request.contact_name}</TableCell>
                        <TableCell className="text-sm">
                          {request.contact_phone && request.contact_phone.length > 0
                            ? request.contact_phone[0]
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.location_address ? (
                            <span className="line-clamp-2">{request.location_address}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.budget || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">
                            เปิด
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at!), {
                            addSuffix: true,
                            locale: th
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* View Offers Tab */}
          <TabsContent value="view-offers" className="space-y-4">
            {loadingOffers ? (
              <div className="text-center py-12 text-muted-foreground">กำลังโหลด...</div>
            ) : helpOffers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีรายการอาสาสมัคร
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">ชื่อ</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead className="w-[150px]">บริการที่ให้</TableHead>
                      <TableHead className="w-[120px]">ความสามารถ</TableHead>
                      <TableHead className="w-[120px]">ทักษะ</TableHead>
                      <TableHead className="w-[150px]">ติดต่อ</TableHead>
                      <TableHead className="w-[120px]">พื้นที่</TableHead>
                      <TableHead className="w-[120px]">ช่วงเวลา</TableHead>
                      <TableHead className="w-[100px]">สถานะ</TableHead>
                      <TableHead className="w-[120px]">เวลา</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {helpOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.name}</TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2">{offer.description}</p>
                        </TableCell>
                        <TableCell>
                          {offer.services_offered && offer.services_offered.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {offer.services_offered.slice(0, 2).map((service: string) => (
                                <Badge key={service} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                              {offer.services_offered.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{offer.services_offered.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {offer.capacity || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {offer.skills || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {offer.contact_info}
                        </TableCell>
                        <TableCell className="text-sm">
                          {offer.location_area || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {offer.availability || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs bg-green-500">
                            พร้อม
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(offer.created_at!), {
                            addSuffix: true,
                            locale: th
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}