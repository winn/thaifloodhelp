import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Clock, User, HandHeart, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

export default function HelpBrowse() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');

  const { data: helpRequests = [], isLoading: loadingRequests } = useQuery({
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

  const { data: helpOffers = [], isLoading: loadingOffers } = useQuery({
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้าหลัก
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ขอความช่วยเหลือ
          </h1>
          <p className="text-muted-foreground">
            โพสต์ความต้องการความช่วยเหลือของคุณ หรือเสนอให้ความช่วยเหลือ
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'requests' | 'offers')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="requests" className="gap-2">
              <HandHeart className="w-4 h-4" />
              ขอความช่วยเหลือ
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <Users className="w-4 h-4" />
              เสนอให้ความช่วยเหลือ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => navigate('/help-request')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <HandHeart className="w-4 h-4 mr-2" />
                ขอความช่วยเหลือ
              </Button>
            </div>
            
            {loadingRequests ? (
              <div className="text-center py-12 text-muted-foreground">กำลังโหลด...</div>
            ) : helpRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีรายการผู้ต้องการความช่วยเหลือ
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {helpRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge variant="destructive" className="shrink-0">เปิด</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                      
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
                        
                        {request.location_address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{request.location_address}</span>
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
            )}
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => navigate('/help-offer')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                เสนอให้ความช่วยเหลือ
              </Button>
            </div>
            
            {loadingOffers ? (
              <div className="text-center py-12 text-muted-foreground">กำลังโหลด...</div>
            ) : helpOffers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีรายการอาสาสมัคร
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {helpOffers.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg">{offer.name}</CardTitle>
                        <Badge className="shrink-0 bg-green-500">พร้อม</Badge>
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
                        
                        {offer.availability && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{offer.availability}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-muted-foreground text-xs pt-2 border-t">
                          <Clock className="w-3 h-3" />
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
