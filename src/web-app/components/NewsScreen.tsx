import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Newspaper, ExternalLink, Calendar, User } from 'lucide-react-native';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  category: 'club' | 'industry';
  source?: string;
  link?: string;
}

export function NewsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'club' | 'industry'>('all');

  // Mock Club Officer Articles
  const clubNews: NewsArticle[] = [
    {
      id: '1',
      title: '2026 UW Pool Championship Registration Open',
      date: '12/9/25',
      author: 'Alex Johnson, President',
      excerpt: 'Registration is now OPEN for the 2026 UW Pool Championship Qualifier. Don\'t miss your chance to compete for the title!',
      category: 'club'
    },
    {
      id: '2',
      title: 'Holiday Tournament & Party',
      date: '12/15/25',
      author: 'Sarah Chen, Events Coordinator',
      excerpt: 'Ho ho ho! Join us for a festive holiday party pool tournament at HUB Games Area. Prizes, snacks, and fun for all skill levels!',
      category: 'club'
    },
    {
      id: '3',
      title: 'New Season Starting in 2026',
      date: '12/3/25',
      author: 'Michael Torres, League Director',
      excerpt: 'Hi Everyone! As we wrap up another great year and prepare for 2026, we\'re excited to announce our new season schedule and format changes.',
      category: 'club'
    },
    {
      id: '4',
      title: 'Beginner Workshop Series Announcement',
      date: '11/28/25',
      author: 'Jennifer Park, Training Lead',
      excerpt: 'New to pool? We\'re launching a beginner workshop series starting in January. Learn fundamentals from our experienced players!',
      category: 'club'
    }
  ];

  // Mock OxBilliards Industry News
  const industryNews: NewsArticle[] = [
    {
      id: '5',
      title: 'Shane Van Boening Wins 2024 U.S. Open',
      date: '12/20/25',
      author: 'OxBilliards',
      excerpt: 'The "South Dakota Kid" claims his sixth U.S. Open 9-Ball Championship title in Atlantic City, defeating Jayson Shaw in the finals.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog'
    },
    {
      id: '6',
      title: 'New Carbon Fiber Cue Technology Released',
      date: '12/18/25',
      author: 'OxBilliards',
      excerpt: 'Predator announces breakthrough carbon fiber shaft design promising unprecedented accuracy and reduced deflection.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog'
    },
    {
      id: '7',
      title: 'Mosconi Cup Returns to Las Vegas',
      date: '12/10/25',
      author: 'OxBilliards',
      excerpt: 'The prestigious team event returns to Las Vegas for 2026, featuring Team USA vs Team Europe in the annual pool showdown.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog'
    },
    {
      id: '8',
      title: 'APA National Championships Preview',
      date: '12/5/25',
      author: 'OxBilliards',
      excerpt: 'Over 650 teams are set to compete in the 2026 APA National Team Championships in Las Vegas this summer.',
      category: 'industry',
      source: 'OxBilliards.com',
      link: 'https://www.oxbilliards.com/news-blog'
    }
  ];

  const allNews = [...clubNews, ...industryNews].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getFilteredNews = () => {
    if (activeFilter === 'club') return clubNews;
    if (activeFilter === 'industry') return industryNews;
    return allNews;
  };

  const filteredNews = getFilteredNews();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2>News & Updates</h2>
        <p className="text-sm text-muted-foreground">
          Stay updated with club announcements and pool industry news
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All News
        </Button>
        <Button
          variant={activeFilter === 'club' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('club')}
        >
          Club Updates
        </Button>
        <Button
          variant={activeFilter === 'industry' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('industry')}
        >
          Industry News
        </Button>
      </div>

      {/* News Articles */}
      <div className="space-y-3">
        {filteredNews.map((article) => (
          <Card 
            key={article.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => article.link && window.open(article.link, '_blank')}
          >
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Newspaper className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold line-clamp-2">{article.title}</h4>
                    {article.category === 'industry' && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{article.author}</span>
                    </div>
                    {article.source && (
                      <Badge variant="outline" className="text-xs">
                        {article.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No news articles found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
