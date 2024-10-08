import { ActivityIndicator, FlatList as RNFlatList } from 'react-native';
import styled from 'styled-components/native';
import { MovieType } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootNavParamList } from '../../navigations/RootNav';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchData } from '../../utils/fetch';
import { useEffect, useState } from 'react';

const FlatList = styled.FlatList`` as unknown as typeof RNFlatList;
const Separator = styled.View`
  width: 100%;
  border: 0.5px solid ${props => props.theme.neutralBg};
  margin: 5px 0;
`;
const Item = styled.TouchableOpacity`
  flex-direction: row;
`;
const PosterImage = styled.Image`
  width: 60px;
  height: 90px;
`;
const Info = styled.View`
  flex: 1;
  padding: 5px;
`;
const Title = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.theme.mainText};
`;
const ReleastDate = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.neutralText};
  margin-top: 5px;
`;
const NoResultContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
const NoResultText = styled.Text`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.theme.mainText};
`;
const NoResultText2 = styled.Text`
  font-size: 18px;
  font-weight: 400;
  color: ${props => props.theme.neutralText};
`;

interface MovieDataType {
  page: number;
  results: MovieType[];
  total_pages: number;
  total_results: number;
}
interface MovieResultProps {
  searchQuery: string;
}
const MovieResult = ({ searchQuery }: MovieResultProps) => {
  const navigation =
    useNavigation<StackNavigationProp<RootNavParamList, 'Tab'>>();

  const [ShowNoResult, setShowNoResult] = useState<boolean>(false);

  const {
    data: movieData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MovieDataType>({
    queryKey: ['search', 'movie', searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchData.search.movie(searchQuery, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
      return undefined;
    },
  });

  const renderItem = ({ item }: { item: MovieType }) => (
    <Item onPress={() => navigation.push('Detail', { id: item.id })}>
      <PosterImage
        source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }}
      />
      <Info>
        <Title>{item.title}</Title>
        <Title>({item.original_title})</Title>
        <ReleastDate>{item.release_date}</ReleastDate>
      </Info>
    </Item>
  );

  useEffect(() => {
    if (movieData?.pages[0].total_results === 0 && searchQuery !== '') {
      setShowNoResult(true);
    } else {
      setShowNoResult(false);
    }
  }, [movieData, searchQuery]);

  return ShowNoResult ? (
    <NoResultContainer>
      <NoResultText>결과 없음</NoResultText>
      <NoResultText2>새로운 검색을 시도하십시오.</NoResultText2>
    </NoResultContainer>
  ) : (
    <FlatList
      keyExtractor={item => item.id.toString()}
      data={movieData?.pages.flatMap(page => page.results) || []}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.25}
      ListFooterComponent={() =>
        isFetchingNextPage ? <ActivityIndicator size="small" /> : null
      }
    />
  );
};

export { MovieResult };
