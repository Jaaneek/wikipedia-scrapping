import { Button } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { Box } from '@chakra-ui/layout';
import { Stat, StatLabel } from '@chakra-ui/stat';
import { useToast } from '@chakra-ui/toast';
import React, { useEffect, useState } from 'react';
import { useThrottleFn } from 'react-use';
import * as SharedTypes from 'shared/types';
import * as R from 'ramda';
//eslint-disable-next-line
import SanitizedHTML from 'react-sanitized-html';
import axios from 'axios';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
const SearchList: React.FC = () => {
  const toast = useToast();
  const [phrase, setPhrase] = useState('company');
  const [textToHighlight, setTextToHighlight] = useState(phrase);
  const [replaceWith, setReplaceWith] = useState('');

  const [data, setData] = useState<SharedTypes.Response>();
  const [error, setError] = useState<Boolean>(false);
  const refetch = () => {
    axios
      .get<SharedTypes.Response>(
        'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=%22' +
          phrase +
          '%22&srlimit=10&origin=*'
      )
      .then((res) => {
        setData(res.data);
        setTextToHighlight(phrase);
        setError(false);
      })
      .catch(() => setError(true));
  };
  const [searchResults, setSearchResults] = useState<SharedTypes.SearchResult[]>([]);

  const replaceFirst = () => {
    setSearchResults(
      searchResults.map((el, index) => {
        if (index === 0) {
          const replacedSnippet = R.replace(new RegExp(phrase, 'i'), replaceWith, searchResults[0].snippet);

          return { ...el, snippet: replacedSnippet };
        }
        return el;
      })
    );
  };

  const replaceAll = () => {
    setSearchResults(
      searchResults.map((el) => {
        const replacedSnippet = R.replace(new RegExp(phrase, 'ig'), replaceWith, el.snippet);

        return { ...el, snippet: replacedSnippet };
      })
    );
  };
  useEffect(() => {
    refetch();
    //eslint-disable-next-line
  }, []);

  const throttledValue = useThrottleFn((value: string) => value, 3000, [phrase]);
  useEffect(
    () => {
      refetch();
    },
    //eslint-disable-next-line
    [throttledValue]
  );
  useEffect(() => {
    if (error || !data) return;
    setSearchResults(data!.query.search);
    //eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    toast({
      title: 'Error!',
      description: 'Something went wrong, try again later.',
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
    //eslint-disable-next-line
  }, [error]);

  return (
    <Box p={4}>
      <Button
        onClick={() => {
          refetch();
        }}
      >
        Search
      </Button>
      <Button
        onClick={() => {
          replaceFirst();
        }}
      >
        Replace
      </Button>
      <Button
        onClick={() => {
          replaceAll();
        }}
      >
        Replace all
      </Button>
      <FormControl>
        <FormLabel>Search phrase</FormLabel>
        <Input w={200} value={phrase} onChange={(e) => setPhrase(e.target.value)}></Input>{' '}
      </FormControl>
      <FormControl>
        <FormLabel>Replace with</FormLabel>
        <Input w={200} value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)}></Input>
      </FormControl>
      {searchResults.map((searchResult) => {
        return (
          <Stat>
            <StatLabel>{searchResult.title}</StatLabel>
            <Box p={2} color="GrayText">
              <SanitizedHTML
                html={R.replace(
                  new RegExp(textToHighlight, 'ig'),
                  `<mark>${textToHighlight}</mark>`,
                  searchResult.snippet
                )}
              />
            </Box>
          </Stat>
        );
      })}
    </Box>
  );
};

export default SearchList;
